let BUFFER_GEOMETRY_ID = 0;

class BufferGeometry {
    readonly id: number;

    readonly vertexBuffer: Float32Array;
    readonly indexBuffer: Int16Array;
    readonly vertexCount: number;
    readonly indexCount: number;

    constructor(options: {
        vertexCount: number,
        indexCount: number,
    }) {
        this.vertexBuffer = new Float32Array(options.vertexCount * 3);
        this.indexBuffer = new Int16Array(options.indexCount);
        this.vertexCount = options.vertexCount;
        this.indexCount = options.indexCount;
        this.id = BUFFER_GEOMETRY_ID++;
    }

    setVertices(positions: number[]) {
        this.vertexBuffer.set(positions, 0);
    }

    setIndices(indices: number[]) {
        this.indexBuffer.set(indices, 0);
    }

    static screenQuad(): BufferGeometry {
        const buf = new BufferGeometry({
            vertexCount: 4,
            indexCount: 6
        });

        buf.setVertices([
            -1.0, -1.0, 0.0, // bottom left
            -1.0,  1.0, 0.0, // top left
             1.0,  1.0, 0.0, // top right
             1.0, -1.0, 0.0, // bottom right
        ]);

        buf.setIndices([
            0, 1, 2,
            0, 2, 3
        ]);

        return buf;
    }
}

export default BufferGeometry;
