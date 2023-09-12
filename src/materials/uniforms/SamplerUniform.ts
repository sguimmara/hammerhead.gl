import { Sampler } from '@textures';
import Uniform from './Uniform';

/**
 * A uniform that maps to a GPU sampler.
 */
export default class SamplerUniform implements Uniform<Sampler> {
    value: Sampler;
    private version = 0;
    readonly type = 'sampler';

    constructor() {
        this.value = new Sampler();
    }

    getVersion(): number {
        return this.version;
    }

    incrementVersion(): void {
        this.version++;
    }
}
