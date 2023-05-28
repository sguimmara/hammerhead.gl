let TEXTURE_ID = 0;

abstract class Texture {
    readonly width: number;
    readonly height: number;
    readonly id: number;

    constructor(options: {
        width: number,
        height: number,
    }) {
        this.id = TEXTURE_ID++;
        this.width = options.width;
        this.height = options.height;
    }

    getData(): BufferSource {
        // TODO
        throw new Error('not implemented');
    }
}

export default Texture;
