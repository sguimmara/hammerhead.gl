import { Mat4, mat4 } from "wgpu-matrix";
import { deg2rad } from "../core/MathUtils";

type CameraMode = 'orthographic' | 'perspective';``

const DEFAULT_FOV = deg2rad(45);

export default class Camera {
    mode: CameraMode;

    viewMatrix: Mat4 = mat4.identity();
    projectionMatrix: Mat4;
    fieldOfView: number = DEFAULT_FOV;
    nearPlane: number = 0.1;
    farPlane: number = 1000;

    constructor(mode : CameraMode) {
        this.mode = mode;
    }

    updateProjectionMatrix(aspect: number) {
        this.projectionMatrix = mat4.perspective(this.fieldOfView, aspect, this.nearPlane, this.farPlane, this.projectionMatrix);
    }
}