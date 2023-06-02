let BUFFER_GEOMETRY_ID = 0;
import { Color } from "chroma-js";
import { EventDispatcher, EventHandler, Observable } from "../core/EventDispatcher";
import { VertexBufferSlot } from "../core/constants";

class BufferGeometry implements Observable, Destroy {
    private readonly dispatcher: EventDispatcher<BufferGeometry>;
    readonly id: number;

    version: number;
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
            VertexBufferSlot.Position,
            new Float32Array(options.vertexCount * 3));
        this.indexBuffer = new Int16Array(options.indexCount);
        this.vertexCount = options.vertexCount;
        this.indexCount = options.indexCount;
        this.dispatcher = new EventDispatcher<BufferGeometry>(this);
    }

    on(type: string, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    destroy() {
        this.dispatcher.dispatch('destroy');
    }

    getVertexBuffer(slot: VertexBufferSlot): Float32Array | null {
        return this.vertexBuffers.get(slot);
    }

    setVertices(positions: number[]) {
        this.vertexBuffers.get(VertexBufferSlot.Position).set(positions, 0);
        this.version++;
    }

    setColors(colors?: Color[] | Color) {
        if (!this.vertexBuffers.has(VertexBufferSlot.Color)) {
            this.vertexBuffers.set(VertexBufferSlot.Color, new Float32Array(this.vertexCount * 4));
        }

        if (Array.isArray(colors)) {
            const values = colors.flatMap(c => c.gl());
            this.vertexBuffers.get(VertexBufferSlot.Color).set(values);
        } else if (colors) {
            const gl = colors.gl();
            for (let i = 0; i < this.vertexCount; i++) {
                this.vertexBuffers.get(VertexBufferSlot.Color).set(gl, i * 4);
            }
        }
        this.version++;
    }

    setTexCoords(coords?: number[]) {
        if (!this.vertexBuffers.has(VertexBufferSlot.TexCoord)) {
            this.vertexBuffers.set(VertexBufferSlot.TexCoord, new Float32Array(this.vertexCount * 2));
        }

        if (coords) {
            this.vertexBuffers.get(VertexBufferSlot.TexCoord).set(coords, 0);
        }
        this.version++;
    }

    setIndices(indices: number[]) {
        this.indexBuffer.set(indices, 0);
        this.version++;
    }
}

export default BufferGeometry;
