import {
    Box3,
    Clone,
    Destroy,
    EventDispatcher,
    EventHandler,
    Observable,
    Version,
    Versioned,
} from "@/core";

let ID = 0;

/**
 * The supported vertex attribute names.
 */
export type Attribute =
    | "position"
    | "normal"
    | "texcoord"
    | "texcoord1"
    | "texcoord2"
    | "tangent"
    | "color";

/**
 * The supported event names.
 */
export interface Events {
    'destroyed': undefined;
}

function initializeArray(vertexCount: number, elementSize: number, fillValue: number) {
    const array = new Float32Array(vertexCount * elementSize);
    array.fill(fillValue);
    return array;
}

/**
 * A collection of vertex attributes and an optional index buffer.
 */
export default class Mesh implements Version, Destroy, Clone, Observable<Mesh, Events> {
    readonly id: number;
    private readonly attributes: Map<Attribute, Versioned<Float32Array>>;
    private indices: Uint16Array | Uint32Array;
    private version: number = 0;
    private readonly dispatcher: EventDispatcher<Mesh, Events>;
    private bounds: Box3;
    private _topology: GPUPrimitiveTopology;
    readonly frontFace: GPUFrontFace;


    get indexFormat(): GPUIndexFormat {
        return this.indices instanceof Uint16Array ? "uint16" : "uint32";
    }

    get vertexCount() {
        return this.attributes.get("position").value.length / 3;
    }

    get indexCount() {
        return this.indices?.length ?? 0;
    }

    get topology() {
        return this._topology;
    }

    setTopology(topology: GPUPrimitiveTopology) {
        this._topology = topology;
        this.incrementVersion();
    }

    constructor(
        params: {
            topology?: GPUPrimitiveTopology,
            frontFace?: GPUFrontFace,
        } = {
            topology: 'triangle-list',
            frontFace: 'cw'
        }
    ) {
        this.id = ID++;
        this._topology = params.topology;
        this.frontFace = params.frontFace;
        this.attributes = new Map();
        this.dispatcher = new EventDispatcher(this);
    }

    /**
     * Returns a shallow clone of this mesh, i.e all buffers
     * are not cloned.
     * @returns The cloned mesh.
     */
    clone(): Mesh {
        const result = new Mesh({
            topology: this.topology,
            frontFace: this.frontFace
        });

        const indices = this.getIndices();
        if (indices) {
            result.setIndices(indices);
        }
        for (const [attr, value] of this.attributes) {
            result.setAttribute(attr, value.value);
        }

        return result;
    }

    getBounds(): Box3 {
        if (!this.bounds) {
            this.bounds = Box3.fromPoints(this.attributes.get("position").value);
        }
        return this.bounds;
    }

    on<K extends keyof Events>(type: K, handler: EventHandler<Mesh, Events[K]>): void {
        return this.dispatcher.on(type, handler);
    }

    getVersion(): number {
        return this.version;
    }

    incrementVersion(): void {
        this.version++;
    }

    setIndices(indices: Uint16Array | Uint32Array) {
        this.indices = indices;
        this.incrementVersion();
    }

    destroy(): void {
        this.dispatcher.dispatch('destroyed');
    }

    getIndices(): Uint16Array | Uint32Array {
        return this.indices;
    }

    setAttribute(type: Attribute, buffer: Float32Array) {
        if (type === "position") {
            this.bounds = null;
        }
        // TODO should we constrain the buffer size to match the vertex count ?
        let current = this.attributes.get(type);
        if (current) {
            current.value = buffer;
            current.incrementVersion();
        } else {
            current = new Versioned(buffer);
            this.attributes.set(type, current);
        }
        return current;
    }

    getAttribute(type: Attribute): Versioned<Float32Array> {
        const attr = this.attributes.get(type);
        if (attr != null) {
            return attr;
        }

        // Assign default buffers
        switch (type) {
            case "position":
                throw new Error("no position attribute");
            case "normal":
                return this.setAttribute(
                    type,
                    initializeArray(this.vertexCount, 3, 0)
                );
            case "texcoord":
                return this.setAttribute(
                    type,
                    initializeArray(this.vertexCount, 2, 0)
                );
            case "texcoord1":
                return this.setAttribute(
                    type,
                    initializeArray(this.vertexCount, 2, 0)
                );
            case "texcoord2":
                return this.setAttribute(
                    type,
                    initializeArray(this.vertexCount, 2, 0)
                );
            case "tangent":
                return this.setAttribute(
                    type,
                    initializeArray(this.vertexCount, 3, 0)
                );
            case "color":
                return this.setAttribute(
                    type,
                    initializeArray(this.vertexCount, 4, 1)
                );
        }
    }
}
