import { EventDispatcher, EventHandler, Observable } from "../core/EventDispatcher";

let ID = 0;

/**
 * Base class for all objects in the scene graph.
 */
export default class Object3D implements Observable {
    readonly id: number;
    readonly dispatcher: EventDispatcher<Object3D>;

    /**
     * The active state of the object. An inactive object is not renderable and not traversable.
     */
    active: boolean = true;

    parent: Object3D;
    children: Object3D[];

    constructor() {
        this.id = ID++;
    }

    on(type: string, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
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
                    callback(this.children[i]);
                }
            }
        }
    }
}