import Box3 from "../core/Box3";
import Destroy from "../core/Destroy";
import { EventDispatcher, EventHandler, Observable } from "../core/EventDispatcher";
import Transform from "../core/Transform";

let ID = 0;

/**
 * Base class for all objects in the scene graph.
 * @fires added When this object is added as a child of another object.
 */
export default class Object3D implements Observable, Destroy {
    readonly id: number;
    readonly dispatcher: EventDispatcher<Object3D>;
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
        this.dispatcher = new EventDispatcher<Object3D>(this);
    }

    on(type: string, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    /**
     * Returns the axis-aligned bounding box (AABB) of this object.
     */
    getWorldBounds(): Box3 {
        const children = this.children.map(c => c.getWorldBounds());
        return Box3.union(children);
    }

    destroy(): void {
        this.dispatch('destroy');
    }

    protected dispatch(type: string) {
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