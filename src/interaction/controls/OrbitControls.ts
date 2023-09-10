import { Camera } from '@/scene';
import Controls from './Controls';
import { Vec3, vec3 } from 'wgpu-matrix';

export default class OrbitControls extends Controls {
    private readonly _interactiveElement: HTMLElement;
    private _target : Vec3 = [0, 0, 0];

    constructor(camera: Camera, interactiveElement: HTMLElement) {
        super(camera);
        this._interactiveElement = interactiveElement;

        this._interactiveElement.addEventListener('pointermove', this.onPointerMove);
        this._interactiveElement.addEventListener('wheel', ev => this.onZoom(ev));
    }

    set target(v: Vec3) {
        this._target = v;
    }

    get target(): Vec3 {
        return this._target;
    }

    private onPointerMove(event: PointerEvent) {
        if (event.pressure === 1) {
            console.log(event);
        }
    }

    private onZoom(event: WheelEvent) {
        event.preventDefault();
        const factor = event.deltaY;
        const distance = this.getTargetDistance();
        if (distance > 0.5) {
            this.dolly(factor);
        }
    }

    getTargetDistance() {
        return vec3.dist(this.target, this.camera.transform.position);
    }

    dolly(distance: number) {
        const transform = this.camera.transform;
        transform.translateX(distance);
    }
}
