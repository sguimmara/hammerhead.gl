let TEXTURE_ID = 0;

class Texture {
    readonly width: number;
    readonly height: number;
    readonly id: number;
    readonly data: BufferSource;

    constructor(options: {
        width: number,
        height: number,
        data: BufferSource,
    }) {
        this.id = TEXTURE_ID++;
        this.width = options.width;
        this.height = options.height;
        this.data = options.data;
    }
}

export default Texture;
