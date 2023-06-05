let BUFFER_GEOMETRY_ID = 0;
import { Color } from "chroma-js";
import { EventDispatcher, EventHandler, Observable } from "../core/EventDispatcher";
import { VertexBufferSlot } from "../core/constants";
import Destroy from "../core/Destroy";
import Box3 from "../core/Box3";
import Version from "../core/Version";

class BufferGeometry implements Observable, Destroy, Version {
    private readonly dispatcher: EventDispatcher<BufferGeometry>;
    readonly id: number;

    private version: number;
    readonly vertexBuffers: Map<VertexBufferSlot, Float32Array>;
    readonly indexBuffer: Uint16Array | Uint32Array;
    readonly vertexCount: number;
    readonly indexCount: number;
    private cachedBounds: Box3;

    constructor(options: {
        vertexCount: number,
        indexCount: number,
        indexBuffer?: Uint32Array | Uint16Array,
        vertices?: Float32Array,
        texcoordBuffer?: Float32Array,
        colorBuffer?: Float32Array,
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
        if (options.texcoordBuffer) {
            this.setTexCoords(options.texcoordBuffer);
        }
        if (options.colorBuffer) {
            if (!this.vertexBuffers.has(VertexBufferSlot.Color)) {
                this.vertexBuffers.set(VertexBufferSlot.Color, options.colorBuffer);
            }
        }
        this.vertexCount = options.vertexCount;
        this.indexCount = options.indexCount;
        this.dispatcher = new EventDispatcher<BufferGeometry>(this);
    }

    getVersion(): number {
        return this.version;
    }

    incrementVersion(): void {
        this.version++;
    }

    getBounds() {
        if (!this.cachedBounds) {
            this.cachedBounds = Box3.fromPoints(this.vertexBuffers.get(VertexBufferSlot.Position));
        }
        return this.cachedBounds;
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

    setVertices(positions: ArrayLike<number>) {
        this.vertexBuffers.get(VertexBufferSlot.Position).set(positions, 0);
        this.incrementVersion();
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
        this.incrementVersion();
    }

    setTexCoords(coords?: ArrayLike<number>) {
        if (!this.vertexBuffers.has(VertexBufferSlot.TexCoord)) {
            this.vertexBuffers.set(VertexBufferSlot.TexCoord, new Float32Array(this.vertexCount * 2));
        }

        if (coords) {
            this.vertexBuffers.get(VertexBufferSlot.TexCoord).set(coords, 0);
        }
        this.incrementVersion();
    }

    setIndices(indices: ArrayLike<number>) {
        this.indexBuffer.set(indices, 0);
        this.incrementVersion();
    }
}

export default BufferGeometry;
