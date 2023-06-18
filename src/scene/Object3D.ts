import {
    Observable,
    Destroy,
    EventDispatcher,
    Transform,
    EventHandler,
    Box3,
} from "@/core";

let ID = 0;

export type Object3DEvents = 'destroy' | 'added';

/**
 * Base class for all objects in the scene graph.
 * @fires added When this object is added as a child of another object.
 */
export default class Object3D implements Observable<Object3DEvents>, Destroy {
    readonly id: number;
    readonly dispatcher: EventDispatcher<Object3D, Object3DEvents>;
    readonly transform: Transform = new Transform();
    label: string;

    /**
     * The active state of the object. An inactive object is not renderable and not traversable.
     */
    active: boolean = true;

    parent: Object3D;
    children: Object3D[];

    constructor() {
        this.id = ID++;
        this.dispatcher = new EventDispatcher<Object3D, Object3DEvents>(this);
    }

    on(type: Object3DEvents, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    /**
     * Returns the axis-aligned bounding box (AABB) of this object.
     */
    getWorldBounds(): Box3 {
        const children = this.children.map((c) => c.getWorldBounds());
        return Box3.union(children);
    }

    destroy(): void {
        this.dispatch('destroy');
    }

    protected dispatch(type: Object3DEvents) {
        this.dispatcher.dispatch(type);
    }

    /**
     * Adds an object as a child of this object.
     * @param child The child to add.
     */
    add(child: Object3D) {
        child.parent = this;
        if (!this.children) {
            this.children = [child];
        } else {
            this.children.push(child);
        }
        child.transform.localMatrixNeedsUpdate = true;
        child.dispatch('added');
    }

    addMany(children: Iterable<Object3D>) {
        for (const child of children) {
            this.add(child);
        }
    }

    /**
     * Traverse the hierarchy of this object, calling the callback for each visited object.
     * @param callback The callback called for each visited object in the hierarchy.
     */
    traverse(callback: (obj: Object3D) => void) {
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
