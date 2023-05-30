import { Color } from "chroma-js";
import Mesh from "../objects/Mesh";
import BufferStore from "./BufferStore";
import PipelineManager from "./PipelineManager";
import TextureStore from "./TextureStore";
import RenderSceneStage from "./stages/RenderSceneStage";
import Stage from "./stages/Stage";
import PostProcessingStage from "./stages/PostProcessingStage";
import Container from "../Container";
import GlobalUniforms from './GlobalUniforms';
import PostProcessingMaterial from "../materials/postprocessing/PostProcessingMaterial";

class RenderPipeline implements Destroy {
    private readonly stages: Stage[];
    private readonly device: GPUDevice;
    private readonly pipelineManager: PipelineManager;
    private readonly bufferStore: BufferStore;
    private readonly textureStore: TextureStore;
    private readonly sceneStage: RenderSceneStage;

    private finalRenderTexture: GPUTexture;
    private intermediateTextures : GPUTexture[];

    private globalUniforms: GlobalUniforms;

    private clearColor: Color;

    constructor(
        device: GPUDevice,
        container: Container
    ) {
        this.device = device;
        this.globalUniforms = new GlobalUniforms();
        this.pipelineManager = container.get<PipelineManager>('PipelineManager');
        this.bufferStore = container.get<BufferStore>('BufferStore');
        this.textureStore = container.get<TextureStore>('TextureStore');
        this.sceneStage = new RenderSceneStage(this.device, this.bufferStore, this.pipelineManager, this.textureStore, this.globalUniforms);
        this.stages = [this.sceneStage];
        this.intermediateTextures = [null, null];
    }

    /**
     * Removes all stage (except for the default render stage).
     */
    clear() {
        this.stages.forEach(s => s.destroy());
        this.stages.length = 1;
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

    addStage(material: PostProcessingMaterial) {
        const stage = new PostProcessingStage(
            this.device,
            this.bufferStore,
            this.pipelineManager,
            this.textureStore,
            this.globalUniforms
        )
        .withMaterial(material);

        this.stages.push(stage);

        return this;
    }

    updateGlobalUniforms(target: GPUTexture) {
        this.globalUniforms.time = performance.now() / 1000.0;
        this.globalUniforms.screenSize.x = target.width;
        this.globalUniforms.screenSize.y = target.height;
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

        this.updateGlobalUniforms(target);

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