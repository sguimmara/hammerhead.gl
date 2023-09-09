import { MathUtils } from '@/core';
import { Mat4, mat4 } from 'wgpu-matrix';
import Node from './Node';
import { radians } from '@/core/types';

export type CameraMode = 'orthographic' | 'perspective';

const DEFAULT_FOV : radians = MathUtils.deg2rad(45);

/**
 * A camera.
 */
export default class Camera extends Node {
    mode: CameraMode;

    projectionMatrix: Mat4;
    fieldOfView: radians = DEFAULT_FOV;
    nearPlane: number = 0.001;
    farPlane: number = 1000000;

    constructor(mode : CameraMode) {
        super();
        this.mode = mode;
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
