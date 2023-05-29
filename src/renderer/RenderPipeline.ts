import { Color } from "chroma-js";
import Mesh from "../objects/Mesh";
import BufferStore from "./BufferStore";
import PipelineManager from "./PipelineManager";
import TextureStore from "./TextureStore";
import RenderSceneStage from "./stages/RenderSceneStage";
import Stage from "./stages/Stage";
import Material from "../materials/Material";
import PostProcessingStage from "./stages/PostProcessingStage";

class RenderPipeline {
    private readonly stages: Stage[];
    private readonly device: GPUDevice;
    private readonly pipelineManager: PipelineManager;
    private readonly bufferStore: BufferStore;
    private readonly textureStore: TextureStore;
    private readonly sceneStage: RenderSceneStage;

    private finalRenderTexture: GPUTexture;
    private intermediateTextures : GPUTexture[];

    private clearColor: Color;

    constructor(
        device: GPUDevice,
        bufferStore: BufferStore,
        pipelineManager: PipelineManager,
        textureStore: TextureStore
    ) {
        this.device = device;
        this.pipelineManager = pipelineManager;
        this.bufferStore = bufferStore;
        this.textureStore = textureStore;
        this.sceneStage = new RenderSceneStage(this.device, this.bufferStore, this.pipelineManager, this.textureStore);
        this.stages = [this.sceneStage];
        this.intermediateTextures = [null, null];
    }

    setClearColor(color: Color) {
        this.sceneStage.withClearColor(color);
    }

    destroy() {
        this.stages.forEach(s => s.destroy());
    }

    private createSwapTexture(reference: GPUTexture) {
        return this.device.createTexture({
            label: 'swap',
            dimension: '2d',
            format: reference.format,
            size: [reference.width, reference.height],
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
    }

    addStage(material: Material) {
        const stage = new PostProcessingStage(this.device, this.bufferStore, this.pipelineManager, this.textureStore)
            .withMaterial(material);

        this.stages.push(stage);

        return this;
    }

    render(meshes: Iterable<Mesh>, target: GPUTexture) {
        const encoder = this.device.createCommandEncoder();

        if (this.finalRenderTexture != target) {
            this.intermediateTextures.forEach(t => {
                t?.destroy();
            })
            this.intermediateTextures[0] = this.createSwapTexture(target);
            this.intermediateTextures[1] = this.createSwapTexture(target);
            this.finalRenderTexture = target;
        }

        this.sceneStage
            .withOutput(this.stages.length > 1 ? this.intermediateTextures[0] : target)
            .withClearColor(this.clearColor)
            .withMeshes(meshes)
            .execute(encoder);

        if (this.stages.length > 1) {
            for (let i = 1; i < this.stages.length; i++) {
                const prev = this.stages[i - 1];
                const stage = this.stages[i];
                const isLast = i == this.stages.length - 1;
                stage.withInput(prev.getOutput());
                const output = isLast
                    ? this.finalRenderTexture
                    : this.intermediateTextures[i % 2];
                stage.withOutput(output);
                stage.execute(encoder);
            }
        }

        this.device.queue.submit([encoder.finish()]);
    }
}

export default RenderPipeline;