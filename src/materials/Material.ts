import { Color } from "chroma-js";
import { Vec2, Vec4, vec4 } from "wgpu-matrix";

import { ShaderLayout, UniformInfo } from "./ShaderLayout";
import ShaderPreprocessor from "./ShaderPreprocessor";
import { Observable, Destroy, EventDispatcher, EventHandler, Version } from "@/core";
import { Sampler, Texture } from "@/textures";
import {
    TextureUniform,
    SamplerUniform,
    ScalarUniform,
    Vec2Uniform,
    Vec3Uniform,
    Vec4Uniform,
    Mat4Uniform,
    Uniform,
    BufferUniform,
} from "./uniforms";
import UniformType from "./UniformType";

let MATERIAL_ID = 0;

export enum RenderingMode {
    Triangles,
    TriangleLines,
    Points,
    LineList,
}

export enum CullingMode {
    Front,
    Back,
    None,
}

export enum FrontFace {
    CW,
    CCW,
}

export enum BlendOp {
    Add = "add",
    Subtract = "subtract",
    ReverseSubtract = "reverse-subtract",
    Min = "min",
    Max = "max",
}

export enum BlendFactor {
    Zero = "zero",
    One = "one",
    Src = "src",
    OneMinusSrc = "one-minus-src",
    SrcAlpha = "src-alpha",
    OneMinusSrcAlpha = "one-minus-src-alpha",
    Dst = "dst",
    OneMinusDst = "one-minus-dst",
    DstAlpha = "dst-alpha",
    OneMinusDstAlpha = "one-minus-dst-alpha",
    SrcAlphaSaturated = "src-alpha-saturated",
    Constant = "constant",
    OneMinusConstant = "one-minus-constant",
}

export enum DepthCompare {
    Never = "never",
    Less = "less",
    Equal = "equal",
    LessEqual = "less-equal",
    Greater = "greater",
    NotEqual = "not-equal",
    GreaterEqual = "greater-equal",
    Always = "always",
}

export class Blending {
    srcFactor: BlendFactor;
    dstFactor: BlendFactor;
    op: BlendOp;

    static none(): Blending {
        const result = new Blending();
        result.op = BlendOp.Add;
        result.srcFactor = BlendFactor.One;
        result.dstFactor = BlendFactor.One;

        return result;
    }

    static defaultColor(): Blending {
        const result = new Blending();
        result.op = BlendOp.Add;
        result.srcFactor = BlendFactor.SrcAlpha;
        result.dstFactor = BlendFactor.OneMinusSrcAlpha;

        return result;
    }

    static defaultAlpha(): Blending {
        const result = new Blending();
        result.op = BlendOp.Subtract;
        result.srcFactor = BlendFactor.SrcAlpha;
        result.dstFactor = BlendFactor.OneMinusSrcAlpha;

        return result;
    }
}

function allocateUniform(type: UniformType) {
    switch (type) {
        case UniformType.Texture2D:
            return new TextureUniform();
        case UniformType.Sampler:
            return new SamplerUniform();
        case UniformType.Float32:
            return new ScalarUniform();
        case UniformType.Vec2:
            return new Vec2Uniform();
        case UniformType.Vec3:
            return new Vec3Uniform();
        case UniformType.Vec4:
            return new Vec4Uniform();
        case UniformType.Mat4:
            return new Mat4Uniform();
        case UniformType.GlobalValues:
            throw new Error("not implemented");
    }
}

function allocateUniforms(layout: UniformInfo[]): Uniform[] {
    const uniforms = Array(layout.length);
    for (let i = 0; i < layout.length; i++) {
        const info = layout[i];
        uniforms[info.binding] = allocateUniform(info.type);
    }
    return uniforms;
}

export type MaterialEvents = 'destroy';

class Material implements Observable<MaterialEvents>, Destroy, Version {
    private readonly dispatcher: EventDispatcher<Material, MaterialEvents>;
    private readonly uniforms: Uniform[];
    readonly id: number;
    readonly fragmentShader: string;
    readonly vertexShader: string;
    readonly layout: ShaderLayout;
    readonly requiresObjectUniforms: boolean;
    readonly depthWriteEnabled: boolean = true;
    readonly renderingMode: RenderingMode;
    readonly cullingMode: CullingMode;
    readonly frontFace: FrontFace;
    private version: number = 0;
    depthCompare: DepthCompare = DepthCompare.Less;
    colorBlending: Blending = Blending.defaultColor();
    alphaBlending: Blending = Blending.defaultAlpha();

    renderOrder: number = 0;

    /** The active state of this material. An inactive material will not be rendered. */
    active: boolean = true;

    constructor(options: {
        fragmentShader: string;
        vertexShader: string;
        requiresObjectUniforms?: boolean;
        renderingMode?: RenderingMode;
        cullingMode?: CullingMode;
        frontFace?: FrontFace;
        renderOrder?: number,
    }) {
        this.id = MATERIAL_ID++;
        this.requiresObjectUniforms = options.requiresObjectUniforms ?? true;
        const shaderInfo = ShaderPreprocessor.process(options.vertexShader, options.fragmentShader);
        this.fragmentShader = shaderInfo.fragment;
        this.vertexShader = shaderInfo.vertex;
        this.layout = shaderInfo.layout;
        this.cullingMode = options.cullingMode ?? CullingMode.Back; // TODO this should be in the geometry itself
        this.frontFace = options.frontFace ?? FrontFace.CW; // TODO this should be in the geometry itself
        this.renderingMode = options.renderingMode ?? RenderingMode.Triangles; // TODO this should be in the geometry itself
        this.dispatcher = new EventDispatcher<Material, MaterialEvents>(this);
        this.uniforms = allocateUniforms(this.layout.uniforms);
        this.renderOrder = options.renderOrder ?? 0;
    }

    getVersion(): number {
        return this.version;
    }

    incrementVersion(): void {
        this.version++;
    }

    destroy() {
        this.dispatcher.dispatch("destroy");
    }

    on(type: MaterialEvents, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    withRenderOrder(order: number) {
        this.renderOrder = order;
        return this;
    }

    /**
     * Sets the value of a scalar uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setScalar(binding: number, v: number) {
        const uniform = this.uniforms[binding] as BufferUniform;
        uniform.value = v;
        uniform.incrementVersion();
    }

    /**
     * Sets the value of a sampler uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setSampler(binding: number, value: Sampler) {
        const uniform = this.uniforms[binding] as BufferUniform;
        uniform.value = value;
        uniform.incrementVersion();
    }

    /**
     * Sets the value of a color uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setColor(binding: number, color: Color) {
        const [r, g, b, a] = color.gl();
        const uniform = this.uniforms[binding] as BufferUniform;
        uniform.value = vec4.create(r, g, b, a);
        uniform.incrementVersion();
    }

    /**
     * Sets the value of a Vec2 uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setVec2(binding: number, v: Vec2) {
        const uniform = this.uniforms[binding] as BufferUniform;
        uniform.value = v;
        uniform.incrementVersion();
    }

    /**
     * Sets the value of a Vec4 uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setVec4(binding: number, v: Vec4) {
        const uniform = this.uniforms[binding] as BufferUniform;
        uniform.value = v;
        uniform.incrementVersion();
    }

    /**
     * Sets the value of a texture uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setTexture(binding: number, texture: Texture) {
        const uniform = this.uniforms[binding] as TextureUniform;
        uniform.value = texture;
        uniform.incrementVersion();
    }

    getBufferUniforms(): BufferUniform[] {
        const result: BufferUniform[] = [];
        this.uniforms.forEach((u) => {
            if (u instanceof BufferUniform) {
                result.push(u);
            }
        });
        return result;
    }

    getBufferUniform(binding: number): BufferUniform {
        return this.uniforms[binding] as BufferUniform;
    }

    getTexture(binding: number): TextureUniform {
        return this.uniforms[binding] as TextureUniform;
    }

    getSampler(binding: number): SamplerUniform {
        return this.uniforms[binding] as SamplerUniform;
    }
}

export default Material;
