let TEXTURE_ID = 0;

class Texture {
    readonly width: number;
    readonly height: number;
    readonly id: number;
    data: BufferSource;

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

    getData(): BufferSource {
        return this.data;
    }
}

export default Texture;
