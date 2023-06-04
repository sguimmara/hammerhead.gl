import { Mat4, mat4, Vec3 } from "wgpu-matrix";
import Version from "./Version";
import { Visitable, Visitor } from "./Visitable";
import Sized from "./Sized";

export default class Transform implements Version, Sized, Visitable {
    worldMatrix: Mat4 = mat4.identity();
    localMatrix: Mat4 = mat4.identity();
    private version: number = 0;
    private parentVersion: number = -1;
    needsUpdate: boolean;

    incrementVersion(): void {
        this.version++;
    }

    setPosition(x: number|Vec3, y?: number, z?: number) {
        let v;
        if (typeof x === 'number') {
            v = [x, y ?? 0, z ?? 0];
        } else {
            v = x;
        }
        mat4.setTranslation(this.localMatrix, v, this.localMatrix);
        this.incrementVersion();
        this.needsUpdate = true;
    }

    setScale(x: number|Vec3, y?: number, z?: number) {
        let v;
        if (typeof x === 'number') {
            v = [x, y ?? 1, z ?? 1];
        } else {
            v = x;
        }
        mat4.scaling(v, this.localMatrix);
        this.incrementVersion();
        this.needsUpdate = true;
    }

    rotateY(radians: number) {
        if (radians != 0) {
            mat4.rotateY(this.localMatrix, radians, this.localMatrix);
            this.incrementVersion();
            this.needsUpdate = true;
        }
    }

    rotateX(radians: number) {
        if (radians != 0) {
            mat4.rotateX(this.localMatrix, radians, this.localMatrix);
            this.incrementVersion();
            this.needsUpdate = true;
        }
    }

    getVersion(): number {
        return this.version;
    }

    /**
     * Updates the world matrix of this object.
     */
    updateWorldMatrix(parent: Transform) {
        if (parent) {
            if (parent.version > this.parentVersion) {
                mat4.mul(parent.worldMatrix, this.localMatrix, this.worldMatrix);
                this.parentVersion = parent.version;
                this.incrementVersion();
                this.needsUpdate = false;
            }
        } else if (this.needsUpdate) {
            mat4.copy(this.localMatrix, this.worldMatrix);
            this.needsUpdate = false;
        }
    }

    getByteSize(): number {
        return 16 * 4;
    }

    visit(visitor: Visitor): void {
        visitor.visitMat4(this.worldMatrix);
    }
}
