import { Mat4, mat4, Vec3 } from "wgpu-matrix";

export default class Transform {
    worldMatrix: Mat4 = mat4.identity();
    localMatrix: Mat4 = mat4.identity();
    needsUpdate: boolean = true;

    setPosition(x: number|Vec3, y?: number, z?: number) {
        let v;
        if (typeof x === 'number') {
            v = [x, y ?? 0, z ?? 0];
        } else {
            v = x;
        }
        mat4.setTranslation(this.localMatrix, v, this.localMatrix);
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
        this.needsUpdate = true;
    }

    rotateY(radians: number) {
        if (radians != 0) {
            mat4.rotateY(this.localMatrix, radians, this.localMatrix);
            this.needsUpdate = true;
        }
    }

    rotateX(radians: number) {
        if (radians != 0) {
            mat4.rotateX(this.localMatrix, radians, this.localMatrix);
            this.needsUpdate = true;
        }
    }

    /**
     * Updates the world matrix of this object.
     */
    updateWorldMatrix(parent: Transform) {
        if (parent) {
            mat4.mul(parent.worldMatrix, this.localMatrix, this.worldMatrix);
        } else {
            mat4.copy(this.localMatrix, this.worldMatrix);
        }

        this.needsUpdate = false;
    }
}
