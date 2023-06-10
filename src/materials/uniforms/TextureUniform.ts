import { Texture } from "@/textures";
import Uniform from "./Uniform";

export default class TextureUniform implements Uniform {
    readonly value: Texture;

    constructor(texture?: Texture) {
        this.value = texture;
    }
}
