let BUFFER_GEOMETRY_ID = 0;
import { VertexBufferSlot } from "../constants";

class BufferGeometry {
    readonly id: number;

    readonly vertexBuffers: Map<VertexBufferSlot, Float32Array>;
    readonly indexBuffer: Int16Array;
    readonly vertexCount: number;
    readonly indexCount: number;

    constructor(options: {
        vertexCount: number,
        indexCount: number,
    }) {
        this.id = BUFFER_GEOMETRY_ID++;
        this.vertexBuffers = new Map();
        this.vertexBuffers.set(
            VertexBufferSlot.Vertex,
            new Float32Array(options.vertexCount * 3));
        this.indexBuffer = new Int16Array(options.indexCount);
        this.vertexCount = options.vertexCount;
        this.indexCount = options.indexCount;
    }

    getVertexBuffer(slot: VertexBufferSlot): Float32Array | null {
        return this.vertexBuffers.get(slot);
    }

    setVertices(positions: number[]) {
        this.vertexBuffers.get(VertexBufferSlot.Vertex).set(positions, 0);
    }

    setTexCoords(coords: number[]) {
        if (!this.vertexBuffers.has(VertexBufferSlot.TexCoord)) {
            this.vertexBuffers.set(VertexBufferSlot.TexCoord, new Float32Array(this.vertexCount * 2));
        }
        this.vertexBuffers.get(VertexBufferSlot.TexCoord).set(coords, 0);
    }

    setIndices(indices: number[]) {
        this.indexBuffer.set(indices, 0);
    }
}

export default BufferGeometry;
