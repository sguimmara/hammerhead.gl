import {
    Observable,
    Destroy,
    EventDispatcher,
    Transform,
    EventHandler,
    Box3,
} from '@core';

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
    'parent-changed': { old: Node, new: Node };
}

/**
 * Base class for all objects in the scene graph.
 */
export default class Node implements Observable<Node, Events>, Destroy {
    readonly id: number;
    readonly dispatcher: EventDispatcher<Node, Events>;
    readonly transform: Transform = new Transform();
    private _parent: Node;
    label: string;

    /**
     * The active state of the object. An inactive object is not renderable and not traversable.
     */
    active: boolean = true;

    children: Node[];

    set parent(parent: Node) {
        const old = this._parent;
        this._parent = parent;
        this.dispatcher.dispatch('parent-changed', { old, new: parent });
    }

    get parent() {
        return this._parent;
    }

    constructor() {
        this.id = ID++;
        this.dispatcher = new EventDispatcher<Node, Events>(this);
    }

    on<K extends keyof Events>(type: K, handler: EventHandler<Node, Events[K]>): void {
        this.dispatcher.on(type, handler);
    }

    /**
     * Returns the axis-aligned bounding box (AABB) of this object.
     */
    getWorldBounds(): Box3 {
        if (this.children) {
            this.transform.updateWorldMatrix(this.parent?.transform);
            const children = this.children.map((c) => c.getWorldBounds());
            return Box3.union(children);
        } else {
            return null;
        }
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
