import BufferUniform from "../renderer/BufferUniform";
import TextureUniform from "../renderer/TextureUniform";
import ColorUniform from "../renderer/ColorUniform";
import Texture from "../textures/Texture";
import { Color } from 'chroma-js';
import UniformInfo from "./UniformInfo";
import { EventDispatcher, EventHandler, Observable } from "../EventDispatcher";
import Vec2 from '../Vec2';
import Vec2Uniform from "../renderer/Vec2Uniform";
import UniformType from "./UniformType";
import { BindGroups } from "../constants";
import ScalarUniform from "../renderer/ScalarUniform";

let MATERIAL_ID = 0;

function parseUniformType(text: string) : UniformType {
    switch (text) {
        case 'sampler':
            return UniformType.Sampler;
        case 'f32':
            return UniformType.Scalar;
        case 'vec4f':
            return UniformType.Vec4;
        case 'vec3f':
            return UniformType.Vec3;
        case 'vec2f':
            return UniformType.Vec2;
        case 'texture_2d':
            return UniformType.Texture2D;
        case 'GlobalUniforms':
            return UniformType.GlobalUniforms;
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
        case 'GLOBAL_UNIFORMS_BIND_GROUP': return BindGroups.GlobalUniforms;
        case 'OBJECT_UNIFORMS_BIND_GROUP': return BindGroups.ObjectUniforms;
        default:
            throw new ShaderError(`invalid group: ${text}`);
    }
}

function getUniforms(shaderCode: string) : UniformInfo[] {
    const bindingRegex = /^\s*@group\((GLOBAL_UNIFORMS_BIND_GROUP|OBJECT_UNIFORMS_BIND_GROUP)\)\s*@binding\((\d+)\)\s*var(<uniform>)?\s*(\w+)\s*:\s*(\w+)(<f32>)?\s*;\s*$/;
    const lines = shaderCode.split('\n');
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
            if (group == BindGroups.ObjectUniforms) {
                result.push(info);
            }

        }
    }

    return result;
}

abstract class Material implements Observable, Destroy {
    private readonly dispatcher: EventDispatcher<Material>;
    readonly id: number;
    readonly typeId: string;
    readonly shaderCode: string;
    protected bufferUniforms: Map<number, BufferUniform>;
    protected textureUniforms: Map<number, TextureUniform>;
    readonly layout: UniformInfo[];

    constructor(options : {
        typeId: string,
        shaderCode: string,
        layout: UniformInfo[]
    }) {
        this.typeId = options.typeId;
        this.id = MATERIAL_ID++;
        this.shaderCode = options.shaderCode;
        this.layout = options.layout;
        this.dispatcher = new EventDispatcher<Material>(this);
    }

    destroy() {
        this.dispatcher.dispatch('destroy');
    }

    on(type: string, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    protected setScalar(slot: number, value: number) {
        if (!this.bufferUniforms) {
            this.bufferUniforms = new Map();
        }

        // TODO numbers are by-value primitives. We should box it.
        this.bufferUniforms.set(slot, new ScalarUniform(value));
    }

    protected setColor(slot: number, color: Color) {
        if (!this.bufferUniforms) {
            this.bufferUniforms = new Map();
        }
        this.bufferUniforms.set(slot,  new ColorUniform(color));
    }

    protected setVec2(slot: number, vec2: Vec2) {
        if (!this.bufferUniforms) {
            this.bufferUniforms = new Map();
        }
        this.bufferUniforms.set(slot,  new Vec2Uniform(vec2));
    }

    protected setTexture(slot: number, texture: Texture) {
        if (!this.textureUniforms) {
            this.textureUniforms = new Map();
        }
        this.textureUniforms.set(slot, new TextureUniform(texture));
    }

    getBufferUniforms(binding: number): BufferUniform {
        return this.bufferUniforms.get(binding);
    }

    getTexture(binding: number): TextureUniform {
        return this.textureUniforms.get(binding);
    }
}

export default Material;

export { getUniforms };
