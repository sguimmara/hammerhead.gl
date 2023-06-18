import {
    Box3,
    Destroy,
    EventDispatcher,
    EventHandler,
    Observable,
    Version,
} from "@/core";

let ID = 0;

export type Attribute =
    | "position"
    | "normal"
    | "texcoord"
    | "texcoord1"
    | "texcoord2"
    | "tangent"
    | "color";

export type IndexSize = "uint16" | "uint32";

export type MeshEvents = "destroy";

function initializeArray(vertexCount: number, elementSize: number, fillValue: number) {
    const array = new Float32Array(vertexCount * elementSize);
    array.fill(fillValue);
    return array;
}

export default class Mesh implements Version, Destroy, Observable<MeshEvents> {
    readonly id: number;
    private readonly attributes: Map<Attribute, Float32Array>;
    private indices: Uint16Array | Uint32Array;
    private version: number = 0;
    private readonly dispatcher: EventDispatcher<Mesh, MeshEvents>;
    private bounds: Box3;

    get indexSize(): IndexSize {
        return this.indices instanceof Uint16Array ? "uint16" : "uint32";
    }

    get vertexCount() {
        return this.attributes.get("position").length / 3;
    }

    get indexCount() {
        return this.indices?.length ?? 0;
    }

    constructor() {
        this.id = ID++;
        this.attributes = new Map();
        this.dispatcher = new EventDispatcher(this);
    }

    getBounds(): Box3 {
        if (!this.bounds) {
            this.bounds = Box3.fromPoints(this.attributes.get("position"));
        }
        return this.bounds;
    }

    on(type: MeshEvents, handler: EventHandler): void {
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
        this.dispatcher.dispatch("destroy");
    }

    getIndices(): Uint16Array | Uint32Array {
        return this.indices;
    }

    setAttribute(type: Attribute, buffer: Float32Array) {
        if (type === 'position') {
            this.bounds = null;
        }
        // TODO should we constrain the buffer size to match the vertex count ?
        this.attributes.set(type, buffer);
        this.incrementVersion();
        return buffer;
    }

    getAttribute(type: Attribute): Float32Array | null {
        const attr = this.attributes.get(type);
        if (attr != null) {
            return attr;
        }

        // Assign default buffers
        switch (type) {
            case "position": throw new Error('no position attribute');
            case "normal": return this.setAttribute(type, initializeArray(this.vertexCount, 3, 0));
            case "texcoord":  return this.setAttribute(type, initializeArray(this.vertexCount, 2, 0));
            case "texcoord1":  return this.setAttribute(type, initializeArray(this.vertexCount, 2, 0));
            case "texcoord2":  return this.setAttribute(type, initializeArray(this.vertexCount, 2, 0));
            case "tangent":  return this.setAttribute(type, initializeArray(this.vertexCount, 3, 0));
            case "color": return this.setAttribute(type, initializeArray(this.vertexCount, 4, 1));
        }
    }
}
