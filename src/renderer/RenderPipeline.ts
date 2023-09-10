import { Container, Destroy } from '@/core';
import { PostProcessingMaterial } from '@/materials/postprocessing';
import { ObjectUniform } from '@/materials/uniforms';
import { Camera } from '@/scene';
import { Color } from 'chroma-js';

import { PipelineManager } from '.';
import BufferStore from './BufferStore';
import GlobalValues from './GlobalValues';
import RenderCommand from './RenderCommand';
import { PostProcessingStage, RenderSceneStage, Stage } from './stages';
import TextureStore from './TextureStore';

class RenderPipeline implements Destroy {
    private readonly stages: Stage[];
    private readonly device: GPUDevice;
    private readonly pipelineManager: PipelineManager;
    private readonly bufferStore: BufferStore;
    private readonly textureStore: TextureStore;
    private readonly sceneStage: RenderSceneStage;

    private finalRenderTexture: GPUTexture;
    private intermediateTextures: GPUTexture[];

    private globalUniform: ObjectUniform;
    private globalValues: GlobalValues;

    private clearColor: Color;
    private lastFrame: number;

    constructor(device: GPUDevice, container: Container) {
        this.device = device;
        this.globalValues = new GlobalValues();
        this.globalUniform = new ObjectUniform(this.globalValues);
        this.pipelineManager =
            container.get<PipelineManager>('PipelineManager');
        this.bufferStore = container.get<BufferStore>('BufferStore');
        this.textureStore = container.get<TextureStore>('TextureStore');
        this.sceneStage = new RenderSceneStage(
            this.device,
            this.bufferStore,
            this.pipelineManager,
            this.textureStore,
            this.globalUniform
        );
        this.stages = [this.sceneStage];
        this.intermediateTextures = [null, null];
    }

    /**
     * Removes all stage (except for the default render stage).
     */
    resetPipeline() {
        this.stages.forEach((s) => s.destroy());
        this.stages.length = 1;
    }

    setClearColor(color: Color) {
        this.sceneStage.withClearColor(color);
    }

    destroy() {
        this.stages.forEach((s) => s.destroy());
    }

    private createSwapTexture(reference: GPUTexture) {
        return this.device.createTexture({
            label: 'swap',
            dimension: '2d',
            format: reference.format,
            size: [reference.width, reference.height],
            usage:
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.COPY_SRC |
                GPUTextureUsage.RENDER_ATTACHMENT |
                GPUTextureUsage.TEXTURE_BINDING,
        });
    }

    addStage(material: PostProcessingMaterial) {
        const stage = new PostProcessingStage(
            this.device,
            this.bufferStore,
            this.pipelineManager,
            this.textureStore,
            this.globalUniform
        ).withMaterial(material);

        this.stages.push(stage);

        return this;
    }

    updateGlobalValues(target: GPUTexture, camera: Camera) {
        const now = performance.now() / 1000.0;
        this.globalValues.time = now;
        this.globalValues.deltaTime = now - this.lastFrame;
        this.lastFrame = now;

        this.globalValues.screenSize[0] = target.width;
        this.globalValues.screenSize[1] = target.height;

        this.globalValues.viewMatrix = camera.getViewMatrix();

        const aspect = target.width / target.height;
        this.globalValues.projectionMatrix =
            camera.updateProjectionMatrix(aspect);
        this.globalValues.incrementVersion();
    }

    executeRenderCommand(command: RenderCommand) {
        const encoder = this.device.createCommandEncoder();
        const target = command.target;

        if (this.finalRenderTexture != target) {
            this.intermediateTextures.forEach((t) => {
                t?.destroy();
            });
            this.intermediateTextures[0] = this.createSwapTexture(target);
            this.intermediateTextures[1] = this.createSwapTexture(target);
            this.finalRenderTexture = target;
        }

        this.updateGlobalValues(target, command.camera);

        this.sceneStage
            .withOutput(
                this.stages.length > 1 ? this.intermediateTextures[0] : target
            )
            .withClearColor(this.clearColor)
            .withRenderBuckets(command.buckets)
            .executeStage(encoder);

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
                stage.executeStage(encoder);
            }
        }

        this.device.queue.submit([encoder.finish()]);
    }
}

export default RenderPipeline;
