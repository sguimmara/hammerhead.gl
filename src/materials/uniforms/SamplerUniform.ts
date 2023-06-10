import { Sampler } from "@/textures";
import Uniform from "./Uniform";

export default class SamplerUniform implements Uniform {
    readonly value: Sampler;

    constructor() {
        this.value = new Sampler();
    }
}
