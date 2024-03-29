import Source, { TextureData } from './Source';

/**
 * A {@link Source} that comes from a raw buffer.
 */
export default class RawSource implements Source {
    private readonly buffer: BufferSource;
    private readonly _width: number;
    private readonly _height: number;
    readonly isGPUImage: boolean = false;
    flipY: boolean = false;

    constructor(buffer: BufferSource, width: number, height: number) {
        this.buffer = buffer;
        this._width = width;
        this._height = height;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    getImage(): TextureData {
        return this.buffer;
    }
}
