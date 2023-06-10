import { Color } from "chroma-js";
import { Vec2, Vec4, vec4 } from "wgpu-matrix";

import { ShaderLayout, UniformInfo, UniformType } from "./ShaderLayout";
import { Observable, Destroy, EventDispatcher, EventHandler } from "@/core";
import { Sampler, Texture } from "@/textures";
import {
    TextureUniform,
    SamplerUniform,
    ScalarUniform,
    Vec2Uniform,
    Vec4Uniform,
    Mat4Uniform,
    Uniform,
    BufferUniform,
} from "./uniforms";

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

function allocateUniform(type: UniformType) {
    switch (type) {
        case UniformType.Texture2D:
            return new TextureUniform();
        case UniformType.Sampler:
            return new SamplerUniform();
        case UniformType.Scalar:
            return new ScalarUniform();
        case UniformType.Vec2:
            return new Vec2Uniform();
        case UniformType.Vec3:
            throw new Error("not implemented");
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

abstract class Material implements Observable<MaterialEvents>, Destroy {
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
    }) {
        this.id = MATERIAL_ID++;
        this.requiresObjectUniforms = options.requiresObjectUniforms ?? true;
        this.fragmentShader = options.fragmentShader;
        this.vertexShader = options.vertexShader;
        this.cullingMode = options.cullingMode ?? CullingMode.Back;
        this.frontFace = options.frontFace ?? FrontFace.CW;
        this.layout = ShaderLayout.parse(
            this.fragmentShader,
            this.vertexShader
        );
        this.renderingMode = options.renderingMode ?? RenderingMode.Triangles;
        this.dispatcher = new EventDispatcher<Material, MaterialEvents>(this);
        this.uniforms = allocateUniforms(this.layout.uniforms);
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
        this.uniforms[binding].value = value;
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
        this.uniforms[binding].value = texture;
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
