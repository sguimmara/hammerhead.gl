import { Mat4, mat4, quat, Quat, Vec3 } from 'wgpu-matrix';
import { Sized, Version, Visitable, Visitor } from '@/core';
import { radians } from '@/core/types';

const DEFAULT_UP = [0, 1, 0];

/**
 * An object transform. Handles position, rotation and scale.
 */
export default class Transform implements Version, Sized, Visitable {
    scale: Vec3 = [1, 1, 1];
    position: Vec3 = [0, 0, 0];
    worldMatrix: Mat4 = mat4.identity();
    localMatrix: Mat4 = mat4.identity();
    quaternion: Quat = quat.identity();

    private version: number = 0;
    private parentVersion: number = -1;
    localMatrixNeedsUpdate: boolean;

    incrementVersion(): void {
        this.version++;
    }

    private updatePRSFromLocalMatrix() {
        mat4.getTranslation(this.localMatrix, this.position);
        mat4.getScaling(this.localMatrix, this.scale);
        quat.fromMat(this.localMatrix, this.quaternion);
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

    setQuaternion(x: number|Quat, y?: number, z?: number, w?: number) {
        if (typeof x === 'number') {
            quat.set(x, y, z, w, this.quaternion);
        } else {
            quat.set(x[0], x[1], x[2], x[3], this.quaternion);
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

    rotateX(radians: radians) {
        if (radians != 0) {
            quat.rotateX(this.quaternion, radians, this.quaternion);
            this.incrementVersion();
            this.localMatrixNeedsUpdate = true;
        }
    }

    rotateY(radians: radians) {
        if (radians != 0) {
            quat.rotateY(this.quaternion, radians, this.quaternion);
            this.incrementVersion();
            this.localMatrixNeedsUpdate = true;
        }
    }

    rotateZ(radians: radians) {
        if (radians != 0) {
            quat.rotateZ(this.quaternion, radians, this.quaternion);
            this.incrementVersion();
            this.localMatrixNeedsUpdate = true;
        }
    }

    getVersion(): number {
        return this.version;
    }


    private updateLocalMatrix() {
        mat4.fromQuat(this.quaternion, this.localMatrix);
        mat4.scale(this.localMatrix, this.scale, this.localMatrix);
        mat4.setTranslation(this.localMatrix, this.position, this.localMatrix);
        this.localMatrixNeedsUpdate = false;
    }

    getViewMatrix() {
        if (this.localMatrixNeedsUpdate) {
            this.updateLocalMatrix();
        }

        return mat4.inverse(this.worldMatrix);
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
