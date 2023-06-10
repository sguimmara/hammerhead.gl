import { Texture } from "@/textures";
import Uniform from "./Uniform";

/**
 * A uniform that maps to a GPU texture.
 */
export default class TextureUniform implements Uniform {
    readonly value: Texture;

    constructor(texture?: Texture) {
        this.value = texture;
    }
}
