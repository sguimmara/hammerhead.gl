import { BufferUniform, ColorUniform, TextureUniform } from "../renderer/Uniform";
import Texture from "../textures/Texture";
import { Color } from 'chroma-js';
import LayoutInfo from "./LayoutInfo";
import { EventDispatcher, EventHandler, Observable } from "../EventDispatcher";
import Vec2 from '../Vec2';
import Vec2Uniform from "../renderer/Vec2Uniform";

let MATERIAL_ID = 0;

abstract class Material implements Observable, Destroy {
    private readonly dispatcher: EventDispatcher<Material>;
    readonly id: number;
    readonly typeId: string;
    readonly shaderCode: string;
    protected bufferUniforms: Map<number, BufferUniform>;
    protected textureUniforms: Map<number, TextureUniform>;
    readonly layout: LayoutInfo[];

    constructor(options : {
        typeId: string,
        shaderCode: string,
        layout: LayoutInfo[]
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

    getBufferUniforms(slot: number): BufferUniform {
        return this.bufferUniforms.get(slot);
    }

    getTextureUniform(slot: number): TextureUniform {
        return this.textureUniforms.get(slot);
    }
}

export default Material;
