let BUFFER_GEOMETRY_ID = 0;
import { Color } from "chroma-js";
import { EventDispatcher, EventHandler, Observable } from "../core/EventDispatcher";
import { VertexBufferSlot } from "../core/constants";
import Destroy from "../core/Destroy";
import Box3 from "../core/Box3";
import { mat3, mat4, vec3 } from "wgpu-matrix";

class BufferGeometry implements Observable, Destroy {
    private readonly dispatcher: EventDispatcher<BufferGeometry>;
    readonly id: number;

    version: number;
    readonly vertexBuffers: Map<VertexBufferSlot, Float32Array>;
    readonly indexBuffer: Uint16Array | Uint32Array;
    readonly vertexCount: number;
    readonly indexCount: number;
    bounds: Box3;

    constructor(options: {
        vertexCount: number,
        indexCount: number,
        indexBuffer?: Uint32Array | Uint16Array,
        vertices?: Float32Array,
    }) {
        this.id = BUFFER_GEOMETRY_ID++;
        this.vertexBuffers = new Map();
        this.vertexBuffers.set(
            VertexBufferSlot.Position,
            options.vertices ?? new Float32Array(options.vertexCount * 3));
        this.indexBuffer = options.indexBuffer ??
            (options.indexCount > 65536
                ? new Uint32Array(options.indexCount)
                : new Uint16Array(options.indexCount));
        this.vertexCount = options.vertexCount;
        this.indexCount = options.indexCount;
        this.dispatcher = new EventDispatcher<BufferGeometry>(this);
    }

    computeBounds() {
        this.bounds = Box3.fromPoints(this.vertexBuffers.get(VertexBufferSlot.Position));
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
            const buf = this.vertexBuffers.get(VertexBufferSlot.Color);
            for (let i = 0; i < this.vertexCount; i++) {
                buf.set(gl, i * 4);
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
