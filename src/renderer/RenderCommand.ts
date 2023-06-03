import Camera from "../objects/Camera";
import Mesh from "../objects/Mesh";

export default class RenderCommand {
    readonly camera: Camera;
    readonly opaqueList: Mesh[];
    readonly target: GPUTexture;

    constructor(params: {
        camera: Camera,
        opaqueList?: Mesh[],
        target: GPUTexture
    }) {
        this.camera = params.camera;
        this.opaqueList = params.opaqueList;
        this.target = params.target;
    }
}