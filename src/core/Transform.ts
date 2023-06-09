import { Mat4, mat4, Vec3 } from "wgpu-matrix";
import Version from "./Version";
import { Visitable, Visitor } from "./Visitable";
import Sized from "./Sized";

const DEFAULT_UP = [0, 1, 0];

export default class Transform implements Version, Sized, Visitable {
    scale: Vec3 = [1, 1, 1];
    position: Vec3 = [0, 0, 0];
    worldMatrix: Mat4 = mat4.identity();
    localMatrix: Mat4 = mat4.identity();
    rotation: Vec3 = [0, 0, 0]; // TODO use Quaternion

    private version: number = 0;
    private parentVersion: number = -1;
    localMatrixNeedsUpdate: boolean;

    incrementVersion(): void {
        this.version++;
    }

    private updatePRSFromLocalMatrix() {
        mat4.getTranslation(this.localMatrix, this.position);
        mat4.getScaling(this.localMatrix, this.scale);
        // TODO rotation
    }

    lookAt(x: number|Vec3, y?: number, z?: number) {
        this.updateLocalMatrix();
        if (typeof x === 'number') {
            mat4.cameraAim(this.position, [x, y, z], DEFAULT_UP, this.localMatrix);
        } else {
            mat4.cameraAim(this.position, x, DEFAULT_UP, this.localMatrix);
        }
        this.updatePRSFromLocalMatrix();
        this.incrementVersion();
    }

    setPosition(x: number|Vec3, y?: number, z?: number) {
        let v;
        if (typeof x === 'number') {
            this.position[0] = x;
            this.position[1] = y;
            this.position[2] = z;
        } else {
            v = x;

            this.position[0] = v[0];
            this.position[1] = v[1];
            this.position[2] = v[2];
        }
        this.incrementVersion();
        this.localMatrixNeedsUpdate = true;
    }

    setScale(x: number|Vec3, y?: number, z?: number) {
        let v;
        if (typeof x === 'number') {
            this.scale[0] = x;
            this.scale[1] = y;
            this.scale[2] = z;
        } else {
            v = x;

            this.scale[0] = v[0];
            this.scale[1] = v[1];
            this.scale[2] = v[2];
        }
        this.incrementVersion();
        this.localMatrixNeedsUpdate = true;
    }

    translateX(offset: number) {
        if (offset != 0) {
            this.position[0] += offset;
            this.incrementVersion();
            this.localMatrixNeedsUpdate = true;
        }
    }

    translateY(offset: number) {
        if (offset != 0) {
            this.position[1] += offset;
            this.incrementVersion();
            this.localMatrixNeedsUpdate = true;
        }
    }

    translateZ(offset: number) {
        if (offset != 0) {
            this.position[2] += offset;
            this.incrementVersion();
            this.localMatrixNeedsUpdate = true;
        }
    }

    rotateX(radians: number) {
        if (radians != 0) {
            this.rotation[0] += radians;
            this.incrementVersion();
            this.localMatrixNeedsUpdate = true;
        }
    }

    rotateY(radians: number) {
        if (radians != 0) {
            this.rotation[1] += radians;
            this.incrementVersion();
            this.localMatrixNeedsUpdate = true;
        }
    }

    rotateZ(radians: number) {
        if (radians != 0) {
            this.rotation[2] += radians;
            this.incrementVersion();
            this.localMatrixNeedsUpdate = true;
        }
    }

    getVersion(): number {
        return this.version;
    }


    private updateLocalMatrix() {
        mat4.identity(this.localMatrix);
        mat4.rotateX(this.localMatrix, this.rotation[0], this.localMatrix);
        mat4.rotateY(this.localMatrix, this.rotation[1], this.localMatrix);
        mat4.rotateZ(this.localMatrix, this.rotation[2], this.localMatrix);
        mat4.scale(this.localMatrix, this.scale, this.localMatrix);
        mat4.setTranslation(this.localMatrix, this.position, this.localMatrix);
        this.localMatrixNeedsUpdate = false;
    }

    getViewMatrix() {
        // TODO use world matrix
        if (this.localMatrixNeedsUpdate) {
            this.updateLocalMatrix();
        }

        return mat4.inverse(this.localMatrix);
    }

    /**
     * Updates the world matrix of this object.
     */
    updateWorldMatrix(parent: Transform) {
        if (this.localMatrixNeedsUpdate) {
            this.updateLocalMatrix();
        }

        if (parent) {
            if (parent.getVersion() > this.parentVersion) {
                mat4.mul(parent.worldMatrix, this.localMatrix, this.worldMatrix);
                this.parentVersion = parent.getVersion();
                this.incrementVersion();
            }
        } else {
            mat4.copy(this.localMatrix, this.worldMatrix);
            this.incrementVersion();
        }
    }

    getByteSize(): number {
        return 16 * 4;
    }

    visit(visitor: Visitor): void {
        visitor.visitMat4(this.worldMatrix);
    }
}
