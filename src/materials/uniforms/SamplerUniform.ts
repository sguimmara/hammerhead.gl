import { Sampler } from "@/textures";
import Uniform from "./Uniform";

/**
 * A uniform that maps to a GPU sampler.
 */
export default class SamplerUniform implements Uniform {
    readonly value: Sampler;

    constructor() {
        this.value = new Sampler();
    }
}
