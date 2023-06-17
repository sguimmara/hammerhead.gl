import {
    Box3,
    Clone,
    Destroy,
    EventDispatcher,
    EventHandler,
    Observable,
    Version,
    Versioned,
    VertexBufferSlot,
} from '@/core';
import { Color } from 'chroma-js';

let BUFFER_GEOMETRY_ID = 0;

export type GeometryEvents = "destroy";

type IndexSize = 'uint16' | 'uint32';

/**
 * Base class for all geometries.
 */
export default class BufferGeometry implements Observable<GeometryEvents>, Destroy, Clone {
    private readonly dispatcher: EventDispatcher<
        BufferGeometry,
        GeometryEvents
    >;
    readonly id: number;

    readonly attributes: Map<VertexBufferSlot, Versioned<Float32Array>>;
    // Note the absence of Uin16Array: this cannot be used with
    // the vertex pulling technique in vertex shaders
    readonly indexBuffer: Versioned<Uint32Array | Uint16Array>;
    readonly vertexCount: number;
    readonly indexCount: number;
    private cachedBounds: Box3;
    readonly indexSize: IndexSize;

    constructor(options: {
        vertexCount: number;
        indexCount: number;
        indexBuffer?: Uint32Array | Uint16Array;
        vertices?: Float32Array;
        texcoordBuffer?: Float32Array;
        colorBuffer?: Float32Array;
    }) {
        this.id = BUFFER_GEOMETRY_ID++;
        this.attributes = new Map();
        this.attributes.set(
            VertexBufferSlot.Position,
            options.vertices
                ? new Versioned(options.vertices)
                : new Versioned(new Float32Array(options.vertexCount * 3))
        );
        this.indexBuffer = new Versioned(
            options.indexBuffer ?? (options.indexCount <= 65536
                ? new Uint16Array(options.indexCount)
                : new Uint32Array(options.indexCount))
                );
        this.indexSize = this.indexBuffer.value instanceof Uint16Array ? 'uint16' : 'uint32';
        if (options.texcoordBuffer) {
            if (!this.attributes.has(VertexBufferSlot.TexCoord)) {
                this.attributes.set(
                    VertexBufferSlot.TexCoord,
                    new Versioned(options.texcoordBuffer)
                );
            }
        }
        if (options.colorBuffer) {
            if (!this.attributes.has(VertexBufferSlot.Color)) {
                this.attributes.set(
                    VertexBufferSlot.Color,
                    new Versioned<Float32Array>(options.colorBuffer)
                );
            }
        }
        this.vertexCount = options.vertexCount;
        this.indexCount = options.indexCount;
        this.dispatcher = new EventDispatcher<BufferGeometry, GeometryEvents>(
            this
        );
    }

    clone(): BufferGeometry {
        return new BufferGeometry({
            vertexCount: this.vertexCount,
            indexCount: this.indexCount,
            vertices: this.getVertexBuffer(VertexBufferSlot.Position)?.value,
            colorBuffer: this.getVertexBuffer(VertexBufferSlot.Color)?.value,
            texcoordBuffer: this.getVertexBuffer(VertexBufferSlot.TexCoord)
                ?.value,
            indexBuffer: this.indexBuffer.value,
        });
    }

    getLocalBounds() {
        if (!this.cachedBounds) {
            this.cachedBounds = Box3.fromPoints(
                this.attributes.get(VertexBufferSlot.Position).value
            );
        }
        return this.cachedBounds;
    }

    on(type: GeometryEvents, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    destroy() {
        this.dispatcher.dispatch("destroy");
    }

    getVertexBuffer(slot: VertexBufferSlot): Versioned<Float32Array> | null {
        return this.attributes.get(slot);
    }

    setPositions(positions: ArrayLike<number>) {
        const item = this.attributes.get(VertexBufferSlot.Position);
        if (item.value !== positions) {
            item.value.set(positions, 0);
        }
        this.invalidate(item);
    }

    setColors(colors?: Color[] | Color) {
        if (!this.attributes.has(VertexBufferSlot.Color)) {
            this.attributes.set(
                VertexBufferSlot.Color,
                new Versioned(new Float32Array(this.vertexCount * 4))
            );
        }

        const item = this.attributes.get(VertexBufferSlot.Color);
        if (Array.isArray(colors)) {
            const values = colors.flatMap((c) => c.gl());
            item.value.set(values);
        } else if (colors) {
            const gl = colors.gl();
            const buf = item.value;
            for (let i = 0; i < this.vertexCount; i++) {
                buf.set(gl, i * 4);
            }
        }
        this.invalidate(item);
    }

    private invalidate(item: Version) {
        item.incrementVersion();
        this.cachedBounds = null;
    }

    private setAttribute(buf: ArrayLike<number>, slot: number, components: number) {
        if (!this.attributes.has(slot)) {
            this.attributes.set(
                slot,
                new Versioned(new Float32Array(this.vertexCount * components))
            );
        }

        if (buf) {
            const item = this.attributes.get(slot);
            item.value.set(buf, 0);
            this.invalidate(item);
        }
    }

    setTexCoords(coords?: ArrayLike<number>) {
        this.setAttribute(coords, VertexBufferSlot.TexCoord, 2);
    }

    setNormals(normals?: ArrayLike<number>) {
        this.setAttribute(normals, VertexBufferSlot.Normals, 3);
    }

    setIndices(indices: ArrayLike<number>) {
        this.indexBuffer.value.set(indices, 0);
        this.invalidate(this.indexBuffer);
    }
}
