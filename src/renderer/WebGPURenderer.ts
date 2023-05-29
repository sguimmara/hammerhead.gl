import chroma from "chroma-js";
import Mesh from "../objects/Mesh";
import ShaderStore from './ShaderStore';
import BufferStore from "./BufferStore";
import TextureStore from "./TextureStore";
import Desaturate from "../materials/postprocessing/Desaturate";
import RenderPipeline from "./pipelines/RenderPipeline";
import Inverse from "../materials/postprocessing/InvertColors";
import FlipVertically from "../materials/postprocessing/FlipVertically";

const DEFAULT_CLEAR_COLOR = chroma('black');

class WebGPURenderer {
    private readonly device: GPUDevice;
    private readonly context: GPUCanvasContext;
    private readonly bufferStore: BufferStore;
    private readonly textureStore: TextureStore;

    clearColor: chroma.Color;
    shaderStore: ShaderStore;

    renderPipeline: RenderPipeline;

    constructor(device: GPUDevice, context: GPUCanvasContext) {
        this.device = device;
        this.context = context;
        this.clearColor = DEFAULT_CLEAR_COLOR;
        this.bufferStore = new BufferStore(device);
        this.textureStore = new TextureStore(device);
        this.shaderStore = new ShaderStore(device);
        this.renderPipeline = new RenderPipeline(this.device, this.bufferStore, this.shaderStore, this.textureStore);
        this.renderPipeline.addStage(new Inverse());
        this.renderPipeline.addStage(new FlipVertically());
        this.renderPipeline.addStage(new Desaturate());
    }

    render(list : Iterable<Mesh>) {
        this.renderPipeline.render(list, this.context.getCurrentTexture());
    }

}

export default WebGPURenderer;