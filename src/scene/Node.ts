import {
    Observable,
    Destroy,
    EventDispatcher,
    Transform,
    EventHandler,
    Box3,
    ChangedEventArgs,
} from '@core';
import { Mesh } from '@geometries';
import { Material } from '@materials';
import { vec3 } from 'wgpu-matrix';

let ID = 0;

/**
 * Events supported by {@link Node}
 */
export interface Events {
    /**
     * Raised when the node is destroyed.
     */
    'destroyed': undefined;
    /**
     * Raised when the children list has changed.
     */
    'children-changed': undefined;
    /**
     * Raised when the parent has changed.
     */
    'parent-changed': ChangedEventArgs<Node>;
    /**
     * Raised when the material has changed.
     */
    'material-changed': ChangedEventArgs<Material>;
    /**
     * Raised when the mesh has changed.
     */
    'mesh-changed': ChangedEventArgs<Mesh>;
}

/**
 * Base class for all objects in the scene graph.
 */
export default class Node implements Observable<Node, Events>, Destroy {
    readonly id: number;
    readonly dispatcher: EventDispatcher<Node, Events>;
    readonly transform: Transform = new Transform();
    private _parent: Node;

    private _material: Material;
    private _mesh: Mesh;

    /**
     * User-defined metadata on the object.
     */
    metadata: Record<string, unknown> = {};

    /**
     * Optional label.
     */
    label?: string;

    /**
     * The active state of the object. An inactive object is not renderable and not traversable.
     */
    active: boolean = true;

    children: Node[];

    set parent(parent: Node) {
        const oldValue = this._parent;
        this._parent = parent;
        this.dispatcher.dispatch('parent-changed', { oldValue, newValue: parent });
    }

    get parent() {
        return this._parent;
    }

    get material() {
        return this._material;
    }

    set material(v: Material) {
        const oldValue = this._material;
        this._material = v;
        this.dispatcher.dispatch('material-changed', { oldValue: oldValue, newValue: v });
    }

    get mesh() {
        return this._mesh;
    }

    set mesh(v: Mesh) {
        const oldValue = this._mesh;
        this._mesh = v;
        this.dispatcher.dispatch('mesh-changed', { oldValue: oldValue, newValue: v });
    }

    constructor() {
        this.id = ID++;
        this.dispatcher = new EventDispatcher<Node, Events>(this);
    }

    on<K extends keyof Events>(type: K, handler: EventHandler<Node, Events[K]>): void {
        this.dispatcher.on(type, handler);
    }

    setMaterial(material: Material): this {
        this.material = material;
        return this;
    }

    setMesh(mesh: Mesh): this {
        this.mesh = mesh;
        return this;
    }

    /**
     * Returns the axis-aligned bounding box (AABB) of this object and its descendants.
     */
    getWorldBounds(): Box3 {
        const worldBounds = Box3.empty();

        if (this.mesh) {
            const localBounds = this.mesh.getBounds();

            this.transform.updateWorldMatrix(this.parent?.transform);

            const vertices: number[] = [];
            const worldMatrix = this.transform.worldMatrix;
            localBounds.forEachCorner((c) => {
                const c2 = vec3.transformMat4(c, worldMatrix);
                vertices.push(c2[0]);
                vertices.push(c2[1]);
                vertices.push(c2[2]);
            });

            const meshBounds = Box3.fromPoints(vertices);
            worldBounds.expand(meshBounds);
        }

        if (this.children) {
            const childCount = this.children.length;
            for (let i = 0; i < childCount; i++) {
                const child = this.children[i];
                worldBounds.expand(child.getWorldBounds());
            }
        }

        return worldBounds;
    }

    destroy(): void {
        this.dispatcher.dispatch('destroyed');
    }

    /**
     * Adds an object as a child of this object.
     * @param child The child to add.
     */
    add(child: Node) {
        child.parent = this;
        if (!this.children) {
            this.children = [child];
        } else {
            this.children.push(child);
        }
        child.transform.localMatrixNeedsUpdate = true;

        this.dispatcher.dispatch('children-changed');
    }

    addMany(children: Iterable<Node>) {
        for (const child of children) {
            this.add(child);
        }
    }

    /**
     * Traverse the hierarchy of this object, calling the callback for each visited object.
     * @param callback The callback called for each visited object in the hierarchy.
     */
    traverse(callback: (obj: Node) => void) {
        if (this.active) {
            callback(this);
            if (this.children) {
                for (let i = 0; i < this.children.length; i++) {
                    this.children[i].traverse(callback);
                }
            }
        }
    }
}
