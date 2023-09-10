import { Texture } from '@/textures';
import Uniform from './Uniform';
import { Version } from '@/core';

/**
 * A uniform that maps to a GPU texture.
 */
export default class TextureUniform implements Uniform<Texture>, Version {
    value: Texture;
    private version: number = -1;
    readonly type = 'texture';

    constructor(texture?: Texture) {
        this.value = texture;
    }

    getVersion(): number {
        return this.version;
    }

    incrementVersion(): void {
        this.version++;
    }
}
