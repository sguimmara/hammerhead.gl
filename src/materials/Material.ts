import { Color } from 'chroma-js';
import { Vec2, Vec4, vec4 } from 'wgpu-matrix';

import { ShaderLayout, UniformInfo } from './ShaderLayout';
import ShaderPreprocessor from './ShaderPreprocessor';
import {
    Observable,
    Destroy,
    EventDispatcher,
    EventHandler,
    Version,
} from '@/core';
import { Sampler, Texture } from '@/textures';
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
    ObjectUniform,
} from './uniforms';
import UniformType from './UniformType';
import GlobalValues from '@/renderer/GlobalValues';
import { UntypedBufferUniform } from './uniforms/BufferUniform';
import { UntypedUniform } from './uniforms/Uniform';

let MATERIAL_ID = 0;

export enum BlendOp {
    Add = 'add',
    Subtract = 'subtract',
    ReverseSubtract = 'reverse-subtract',
    Min = 'min',
    Max = 'max',
}

export enum Primitive {
    Triangles = 'triangles',
    WireTriangles = 'wire-triangles',
    Quads = 'quads',
    Lines = 'lines',
}

export enum BlendFactor {
    Zero = 'zero',
    One = 'one',
    Src = 'src',
    OneMinusSrc = 'one-minus-src',
    SrcAlpha = 'src-alpha',
    OneMinusSrcAlpha = 'one-minus-src-alpha',
    Dst = 'dst',
    OneMinusDst = 'one-minus-dst',
    DstAlpha = 'dst-alpha',
    OneMinusDstAlpha = 'one-minus-dst-alpha',
    SrcAlphaSaturated = 'src-alpha-saturated',
    Constant = 'constant',
    OneMinusConstant = 'one-minus-constant',
}

export enum DepthCompare {
    Never = 'never',
    Less = 'less',
    Equal = 'equal',
    LessEqual = 'less-equal',
    Greater = 'greater',
    NotEqual = 'not-equal',
    GreaterEqual = 'greater-equal',
    Always = 'always',
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

function allocateUniform(type: UniformType): UntypedUniform {
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
            return new ObjectUniform(new GlobalValues());
    }
}

function allocateUniforms(layout: UniformInfo[]): UntypedUniform[] {
    const uniforms: UntypedUniform[] = Array<UntypedUniform>(layout.length);
    for (let i = 0; i < layout.length; i++) {
        const info = layout[i];
        uniforms[info.binding] = allocateUniform(info.type);
    }
    return uniforms;
}

export interface Events {
    'destroyed': undefined;
}

export default class Material implements Observable<Material, Events>, Destroy, Version {
    private readonly dispatcher: EventDispatcher<Material, Events>;
    private readonly uniforms: UntypedUniform[];
    readonly id: number;
    readonly fragmentShader: string;
    readonly vertexShader: string;
    readonly layout: ShaderLayout;
    readonly requiresObjectUniforms: boolean;
    readonly depthWriteEnabled: boolean = true;
    readonly cullingMode: GPUCullMode;
    readonly frontFace: GPUFrontFace;
    private version: number = 0;
    readonly primitive: Primitive;
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
        cullingMode?: GPUCullMode;
        renderOrder?: number;
        primitive?: Primitive;
    }) {
        this.id = MATERIAL_ID++;
        this.requiresObjectUniforms = options.requiresObjectUniforms ?? true;
        const shaderInfo = ShaderPreprocessor.process(
            options.vertexShader,
            options.fragmentShader
        );
        this.fragmentShader = shaderInfo.fragment;
        this.vertexShader = shaderInfo.vertex;
        this.layout = shaderInfo.layout;
        this.cullingMode = options.cullingMode ?? 'back';
        this.primitive = options.primitive ?? Primitive.Triangles;
        this.dispatcher = new EventDispatcher<Material, Events>(this);
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
        this.dispatcher.dispatch('destroyed', undefined);
    }

    on<K extends keyof Events>(type: K, handler: EventHandler<Material, Events[K]>): void {
        this.dispatcher.on(type, handler);
    }

    withRenderOrder(order: number) {
        this.renderOrder = order;
        return this;
    }

    protected setUniform<V, T extends Uniform<V>>(binding: number, value: V) {
        const uniform = this.getUniformFromBinding<V, T>(binding);
        uniform.value = value;
        uniform.incrementVersion();
    }

    protected getUniformFromBinding<V, T extends Uniform<V>>(binding: number): T {
        console.assert(
            binding >= 0 && binding < this.uniforms.length,
            `binding number out of bounds. Must be between zero and ${this.uniforms.length - 1}, got: ${binding}`);
        const uniform = this.uniforms[binding] as T;
        return uniform;
    }

    /**
     * Sets the value of a scalar uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setScalar(binding: number, v: number) {
        this.setUniform<number, BufferUniform<number>>(binding, v);
    }

    /**
     * Sets the value of a sampler uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setSampler(binding: number, value: Sampler) {
        this.setUniform<Sampler, BufferUniform<Sampler>>(binding, value);
    }

    /**
     * Sets the value of a color uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setColorUniform(binding: number, color: Color) {
        const [r, g, b, a] = color.gl();
        this.setUniform<Vec4, BufferUniform<Vec4>>(binding, vec4.create(r, g, b, a));
    }

    /**
     * Sets the value of a Vec2 uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setVec2(binding: number, v: Vec2) {
        this.setUniform<Vec2, BufferUniform<Vec2>>(binding, v);
    }

    /**
     * Sets the value of a Vec4 uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setVec4(binding: number, v: Vec4) {
        this.setUniform<Vec4, BufferUniform<Vec4>>(binding, v);
    }

    /**
     * Sets the value of a texture uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setTexture(binding: number, texture: Texture) {
        this.setUniform<Texture, TextureUniform>(binding, texture);
    }

    getBufferUniforms(): UntypedBufferUniform[] {
        const result: UntypedBufferUniform[] = [];
        this.uniforms.forEach((u) => {
            if (u != null && u.type === 'buffer') {
                result.push(u as UntypedBufferUniform);
            }
        });
        return result;
    }

    getUntypedBufferUniform(binding: number): UntypedBufferUniform {
        console.assert(
            binding >= 0 && binding < this.uniforms.length,
            `binding number out of bounds. Must be between zero and ${this.uniforms.length - 1}, got: ${binding}`);
        const uniform = this.uniforms[binding] as UntypedBufferUniform;
        return uniform;
    }

    getTextureUniform(binding: number): TextureUniform {
        return this.getUniformFromBinding<Texture, TextureUniform>(binding);
    }

    getSamplerUniform(binding: number): SamplerUniform {
        return this.getUniformFromBinding<Sampler, SamplerUniform>(binding);
    }
}
