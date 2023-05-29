import Texture from "../textures/Texture";

let MATERIAL_ID = 0;

abstract class Material {
    shaderCode: string;
    id: number;
    textures: Map<number, Texture>;

    constructor(options : {
        shaderCode: string,
    }) {
        this.id = MATERIAL_ID++;
        this.shaderCode = options.shaderCode;
        this.textures = null;
    }

    protected bindTexture(slot: number, texture: Texture) {
        if (!this.textures) {
            this.textures = new Map();
        }
        this.textures.set(slot, texture);
    }

    getBoundTextures(): Map<number, Texture> {
        return this.textures;
    }

}

export default Material;
