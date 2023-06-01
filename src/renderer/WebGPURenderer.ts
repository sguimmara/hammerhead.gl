import chroma from "chroma-js";
import Mesh from "../objects/Mesh";
import RenderPipeline from "./RenderPipeline";
import Container from "../core/Container";
import PostProcessingMaterial from "../materials/postprocessing/PostProcessingMaterial";

const DEFAULT_CLEAR_COLOR = chroma('black');

class WebGPURenderer {
    private readonly device: GPUDevice;
    private readonly context: GPUCanvasContext;

    private renderPipeline: RenderPipeline;

    clearColor: chroma.Color = DEFAULT_CLEAR_COLOR;

    constructor(device: GPUDevice, context: GPUCanvasContext, container: Container) {
        this.device = device;
        this.context = context;

        this.renderPipeline = new RenderPipeline(this.device, container);
    }

    render(list?: Iterable<Mesh>) {
        this.renderPipeline.setClearColor(this.clearColor);
        this.renderPipeline.render(list, this.context.getCurrentTexture());
    }

    setRenderStages(stages: PostProcessingMaterial[]) {
        this.renderPipeline.clear();
        for (const material of stages) {
            this.renderPipeline.addStage(material);
        }
    }

    destroy() {
        this.renderPipeline.destroy();
    }
}

export default WebGPURenderer;