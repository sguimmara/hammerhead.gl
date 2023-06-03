import { Color } from "chroma-js";
import { Vec4, Vec2, vec4 } from "wgpu-matrix";
import Destroy from "../core/Destroy";
import { Observable, EventHandler, EventDispatcher } from "../core/EventDispatcher";
import Sampler from "../textures/Sampler";
import Texture from "../textures/Texture";
import { UniformType, UniformInfo, ShaderLayout } from "./ShaderLayout";
import BufferUniform from "./uniforms/BufferUniform";
import SamplerUniform from "./uniforms/SamplerUniform";
import ScalarUniform from "./uniforms/ScalarUniform";
import TextureUniform from "./uniforms/TextureUniform";
import Uniform from "./uniforms/Uniform";
import Vec2Uniform from "./uniforms/Vec2Uniform";
import Vec4Uniform from "./uniforms/Vec4Uniform";
import Mat4Uniform from "./uniforms/Mat4Uniform";

let MATERIAL_ID = 0;

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

abstract class Material implements Observable, Destroy {
    private readonly dispatcher: EventDispatcher<Material>;
    private readonly uniforms: Uniform[];
    readonly id: number;
    readonly shaderCode: string;
    readonly layout: ShaderLayout;
    readonly requiresObjectUniforms: boolean;
    readonly depthWriteEnabled: boolean = true;

    renderOrder: number = 0;

    /** The active state of this material. An inactive material will not be rendered. */
    active: boolean = true;

    constructor(options: {
        shaderCode: string;
        layout: ShaderLayout;
        requiresObjectUniforms?: boolean,
    }) {
        this.id = MATERIAL_ID++;
        this.requiresObjectUniforms = options.requiresObjectUniforms ?? true;
        this.shaderCode = options.shaderCode;
        this.layout = options.layout;
        this.dispatcher = new EventDispatcher<Material>(this);
        this.uniforms = allocateUniforms(this.layout.uniforms);
    }

    destroy() {
        this.dispatcher.dispatch("destroy");
    }

    on(type: string, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    /**
     * Sets the value of a scalar uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setScalar(binding: number, value: number) {
        this.uniforms[binding].value = value;
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
        uniform.needsUpdate();
    }

    /**
     * Sets the value of a Vec2 uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setVec2(binding: number, v: Vec2) {
        const uniform = this.uniforms[binding] as BufferUniform;
        uniform.value = v;
        uniform.needsUpdate();
    }

    /**
     * Sets the value of a Vec4 uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setVec4(binding: number, v: Vec4) {
        const uniform = this.uniforms[binding] as BufferUniform;
        uniform.value = v;
        uniform.needsUpdate();
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
        this.uniforms.forEach(u => {
            if (u instanceof BufferUniform) {
                result.push(u);
            }
        })
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
