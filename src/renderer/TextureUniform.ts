import Texture from "../textures/Texture";
import Uniform from "./Uniform";

export default class TextureUniform implements Uniform {
    readonly texture: Texture;

    constructor(texture: Texture) {
        this.texture = texture;
    }
}
