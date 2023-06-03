import Camera from "../objects/Camera";
import Bucket from "./Bucket";

export default class RenderCommand {
    readonly camera: Camera;
    readonly buckets: Bucket[];
    readonly target: GPUTexture;

    constructor(params: {
        camera: Camera,
        buckets: Bucket[],
        target: GPUTexture
    }) {
        this.camera = params.camera;
        this.buckets = params.buckets;
        this.target = params.target;
    }
}