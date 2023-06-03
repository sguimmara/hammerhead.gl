import { Mat4, mat4 } from "wgpu-matrix";
import { deg2rad } from "../core/MathUtils";

type CameraMode = 'orthographic' | 'perspective';``

const DEFAULT_FOV = deg2rad(45);

export default class Camera {
    mode: CameraMode;

    viewMatrix: Mat4 = mat4.identity();
    projectionMatrix: Mat4;
    fieldOfView: number = DEFAULT_FOV;
    nearPlane: number = 0.001;
    farPlane: number = 100000;

    constructor(mode : CameraMode) {
        this.mode = mode;
        this.setPosition(0, 0, 0);
    }

    setPosition(x: number, y: number, z: number) {
        mat4.translate(this.viewMatrix, [x, y, z], this.viewMatrix);
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