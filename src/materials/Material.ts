import BufferUniform from "../renderer/BufferUniform";
import TextureUniform from "../renderer/TextureUniform";
import Texture from "../textures/Texture";
import { Color } from "chroma-js";
import { EventDispatcher, EventHandler, Observable } from "../core/EventDispatcher";
import Vec2 from "../core/Vec2";
import Vec2Uniform from "../renderer/Vec2Uniform";
import ScalarUniform from "../renderer/ScalarUniform";
import Uniform from "../renderer/Uniform";
import Vec4Uniform from "../renderer/Vec4Uniform";
import Vec4 from "../core/Vec4";
import SamplerUniform from "../renderer/SamplerUniform";
import Sampler from "../textures/Sampler";
import { UniformType, UniformInfo, ShaderLayout } from "./ShaderLayout";

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

    /** The active state of this material. An inactive material will not be rendered. */
    active: boolean = true;

    constructor(options: {
        shaderCode: string;
        layout: ShaderLayout;
    }) {
        this.id = MATERIAL_ID++;
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
        this.uniforms[binding].value = Vec4.fromColor(color);
    }

    /**
     * Sets the value of a Vec2 uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setVec2(binding: number, vec2: Vec2) {
        this.uniforms[binding].value = vec2;
    }

    /**
     * Sets the value of a Vec3 uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setVec4(binding: number, vec4: Vec4) {
        this.uniforms[binding].value = vec4;
    }

    /**
     * Sets the value of a texture uniform.
     * @param binding The binding number of the uniform.
     * @param value The value.
     */
    protected setTexture(binding: number, texture: Texture) {
        this.uniforms[binding].value = texture;
    }

    getBufferUniforms(binding: number): BufferUniform {
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
