import Destroy from "../core/Destroy";
import { EventDispatcher, EventHandler, Observable } from "../core/EventDispatcher";
import { Mat4, Vec3, mat4 } from 'wgpu-matrix';

let ID = 0;

/**
 * Base class for all objects in the scene graph.
 */
export default class Object3D implements Observable, Destroy {
    readonly id: number;
    readonly dispatcher: EventDispatcher<Object3D>;

    worldMatrix: Mat4 = mat4.identity();
    localMatrix: Mat4 = mat4.identity();

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

    setPosition(x: number|Vec3, y?: number, z?: number) {
        let v;
        if (typeof x === 'number') {
            v = [x, y ?? 0, z ?? 0];
        } else {
            v = x;
        }
        mat4.setTranslation(this.localMatrix, v, this.localMatrix);
    }

    setScale(x: number|Vec3, y?: number, z?: number) {
        let v;
        if (typeof x === 'number') {
            v = [x, y ?? 1, z ?? 1];
        } else {
            v = x;
        }
        mat4.scaling(v, this.localMatrix);
    }

    on(type: string, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
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
                    callback(this.children[i]);
                }
            }
        }
    }
}