import chroma, { Color } from "chroma-js";
import BufferGeometry from "../../geometries/BufferGeometry";
import GeometryBuilder from "../../geometries/GeometryBuilder";
import BufferStore from "../BufferStore";
import PipelineManager from "../PipelineManager";
import TextureStore from "../TextureStore";
import { BindGroups } from "../../constants";
import GlobalUniforms from '../GlobalUniforms';
import Material from "../../materials/Material";
import UniformType from "../../materials/UniformType";

const DEFAULT_CLEAR_COLOR = chroma('black');

abstract class Stage {
    protected readonly device: GPUDevice;
    protected readonly pipelineManager: PipelineManager;
    protected readonly bufferStore: BufferStore;
    protected readonly quad: BufferGeometry;
    protected readonly textureStore: TextureStore;

    protected clearColor: chroma.Color;

    protected input: GPUTexture;
    protected inputView: GPUTextureView;
    protected inputSampler: GPUSampler;

    protected output: GPUTexture;
    protected outputView: GPUTextureView;
    protected renderPassDescriptor: GPURenderPassDescriptor;

    private needsRecreateRenderPass: boolean;
    private globalUniforms: GlobalUniforms;

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
        this.quad = GeometryBuilder.screenQuad();
        this.clearColor = DEFAULT_CLEAR_COLOR;
        this.needsRecreateRenderPass = true;
        this.globalUniforms = new GlobalUniforms();
    }

    bindObjectUniforms(pipeline: GPURenderPipeline, pass: GPURenderPassEncoder, material: Material) {
        const entries : GPUBindGroupEntry[] = [];

        for (const info of material.layout) {
            const slot = info.slot;
            switch (info.type) {
                case UniformType.Texture: {
                    const uniform = material.getTextureUniform(slot);
                    const { view, sampler } = this.textureStore.getTexture(uniform.texture);
                    entries.push({ binding: slot, resource: view });
                    entries.push({ binding: slot + 1, resource: sampler });
                    break;
                }
                case UniformType.Buffer: {
                    const uniform = material.getBufferUniforms(slot);
                    const gpuBuffer = this.bufferStore.getUniformBuffer(uniform);
                    entries.push({ binding: slot, resource: { buffer: gpuBuffer } });
                    break;
                }
            }
        }

        const bindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(BindGroups.ObjectUniforms),
            entries,
        });
        pass.setBindGroup(BindGroups.ObjectUniforms, bindGroup);
    }

    updateGlobalUniforms() {
        this.globalUniforms.time = performance.now() / 1000.0;
    }

    bindGlobalUniforms(pass: GPURenderPassEncoder) {
        this.updateGlobalUniforms();

        const gpuBuffer = this.bufferStore.getUniformBuffer(this.globalUniforms);

        const bindGroup = this.device.createBindGroup({
            label: 'global uniforms BindGroup',
            layout: this.pipelineManager.globalUniformLayout,
            entries: [
                { binding: 0, resource: { buffer: gpuBuffer } },
            ]
        });

        pass.setBindGroup(BindGroups.GlobalUniforms, bindGroup);
    }

    destroy() {
        this.bufferStore.destroyBuffers(this.quad);
    }

    withClearColor(color: Color) {
        this.clearColor = color;
        this.needsRecreateRenderPass = true;
        return this;
    }

    getOutput() {
        return this.output;
    }

    withOutput(output: GPUTexture) {
        if (this.output != output) {
            this.output = output;
            this.outputView = output.createView();
            this.needsRecreateRenderPass = true;
        }

        if (this.needsRecreateRenderPass) {
            const colorAttachment: GPURenderPassColorAttachment = {
                view: this.outputView,
                loadOp: 'clear',
                storeOp: 'store',
                clearValue: this.clearColor.gl(),
            };
            this.renderPassDescriptor = {
                label: 'clear renderPass',
                colorAttachments: [colorAttachment],
            };
        }

        return this;
    }

    withInput(input: GPUTexture) {
        if (input != this.input) {
            this.input = input;
            this.inputSampler = this.device.createSampler();
            this.inputView = input.createView();
        }

        return this;
    }

    abstract execute(encoder: GPUCommandEncoder): void;
}

export default Stage;