import { MathUtils, Transform } from '@/core';
import { Mat4, mat4 } from 'wgpu-matrix';

type CameraMode = 'orthographic' | 'perspective';

const DEFAULT_FOV = MathUtils.deg2rad(45);

export default class Camera {
    mode: CameraMode;

    transform: Transform;
    projectionMatrix: Mat4;
    fieldOfView: number = DEFAULT_FOV;
    nearPlane: number = 0.1 ;
    farPlane: number = 1000;

    constructor(mode : CameraMode) {
        this.mode = mode;
        this.transform = new Transform();
    }

    getViewMatrix() {
        return this.transform.getViewMatrix();
    }

    updateProjectionMatrix(aspect: number) {
        switch (this.mode) {
            case "orthographic":
                this.projectionMatrix = mat4.ortho(-1, +1, -1, +1, -1, +1, this.projectionMatrix);
                break;
            case "perspective":
                this.projectionMatrix = mat4.perspective(this.fieldOfView, aspect, this.nearPlane, this.farPlane, this.projectionMatrix);
                break;
        }
        return this.projectionMatrix;
    }
}
