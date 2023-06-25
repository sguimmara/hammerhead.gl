import {
    Observable,
    Destroy,
    EventDispatcher,
    Transform,
    EventHandler,
    Box3,
} from "@/core";

let ID = 0;

/**
 * Events supported by {@link Node}
 */
export type NodeEvents = 'destroy' | 'added';

/**
 * Base class for all objects in the scene graph.
 * @fires added When this object is added as a child of another object.
 * @fires destroy When this object is destroyed.
 */
export default class Node implements Observable<NodeEvents>, Destroy {
    readonly id: number;
    readonly dispatcher: EventDispatcher<Node, NodeEvents>;
    readonly transform: Transform = new Transform();
    label: string;

    /**
     * The active state of the object. An inactive object is not renderable and not traversable.
     */
    active: boolean = true;

    parent: Node;
    children: Node[];

    constructor() {
        this.id = ID++;
        this.dispatcher = new EventDispatcher<Node, NodeEvents>(this);
    }

    on(type: NodeEvents, handler: EventHandler): void {
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
        this.dispatch('destroy');
    }

    protected dispatch(type: NodeEvents) {
        this.dispatcher.dispatch(type);
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
        child.dispatch('added');
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
