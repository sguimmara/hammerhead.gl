import BufferUniform from "../renderer/BufferUniform";
import TextureUniform from "../renderer/TextureUniform";
import Texture from "../textures/Texture";
import { Color } from "chroma-js";
import UniformInfo from "./UniformInfo";
import { EventDispatcher, EventHandler, Observable } from "../EventDispatcher";
import Vec2 from "../Vec2";
import Vec2Uniform from "../renderer/Vec2Uniform";
import UniformType from "./UniformType";
import { BindGroups } from "../constants";
import ScalarUniform from "../renderer/ScalarUniform";
import Uniform from "../renderer/Uniform";
import Vec4Uniform from "../renderer/Vec4Uniform";
import Vec4 from "../Vec4";
import SamplerUniform from "../renderer/SamplerUniform";
import Sampler from "../textures/Sampler";

let MATERIAL_ID = 0;

function parseUniformType(text: string): UniformType {
    switch (text) {
        case "sampler":
            return UniformType.Sampler;
        case "f32":
            return UniformType.Scalar;
        case "vec4f":
            return UniformType.Vec4;
        case "vec3f":
            return UniformType.Vec3;
        case "vec2f":
            return UniformType.Vec2;
        case "texture_2d":
            return UniformType.Texture2D;
        case "GlobalValues":
            return UniformType.GlobalValues;
        default:
            throw new ShaderError(`invalid uniform type: ${text}`);
    }
}

class ShaderError extends Error {
    constructor(message: string) {
        super(message);
    }
}

function parseGroup(text: string): number {
    switch (text) {
        case "GLOBAL_UNIFORMS_BIND_GROUP":
            return BindGroups.GlobalValues;
        case "OBJECT_UNIFORMS_BIND_GROUP":
            return BindGroups.ObjectUniforms;
        default:
            throw new ShaderError(`invalid group: ${text}`);
    }
}

function getUniforms(shaderCode: string): UniformInfo[] {
    const bindingRegex =
        /^\s*@group\((GLOBAL_UNIFORMS_BIND_GROUP|OBJECT_UNIFORMS_BIND_GROUP)\)\s*@binding\((\d+)\)\s*var(<uniform>)?\s*(\w+)\s*:\s*(\w+)(<f32>)?\s*;\s*$/;
    const lines = shaderCode.split("\n");
    const result = [];
    for (const line of lines) {
        const match = line.match(bindingRegex);
        if (match) {
            const groupMatch = match[1];
            const bindingMatch = match[2];
            const name = match[4];
            const typeGroup = match[5];

            const group = parseGroup(groupMatch);
            const binding = Number.parseInt(bindingMatch);
            if (binding < 0) {
                throw new ShaderError(`invalid binding: ${group}`);
            }
            const type = parseUniformType(typeGroup);

            const info = new UniformInfo(group, binding, type, name);

            // TODO we ignore the global binding for now
            if (group === BindGroups.ObjectUniforms) {
                result.push(info);
            }
        }
    }

    return result;
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
    readonly typeId: string;
    readonly shaderCode: string;
    readonly layout: UniformInfo[];

    constructor(options: {
        typeId: string;
        shaderCode: string;
        layout: UniformInfo[];
    }) {
        this.typeId = options.typeId;
        this.id = MATERIAL_ID++;
        this.shaderCode = options.shaderCode;
        this.layout = options.layout;
        this.dispatcher = new EventDispatcher<Material>(this);
        this.uniforms = allocateUniforms(this.layout);
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

export { getUniforms };
