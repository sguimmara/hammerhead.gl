import chroma, { Color } from "chroma-js";
import BufferGeometry from "../../geometries/BufferGeometry";
import GeometryBuilder from "../../geometries/GeometryBuilder";
import BufferStore from "../BufferStore";
import PipelineManager from "../PipelineManager";
import TextureStore from "../TextureStore";
import ObjectUniform from "../ObjectUniform";

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
    protected GlobalValues: ObjectUniform;

    constructor(
        device: GPUDevice,
        bufferStore: BufferStore,
        pipelineManager: PipelineManager,
        textureStore: TextureStore,
        GlobalValues: ObjectUniform
    ) {
        this.device = device;
        this.pipelineManager = pipelineManager;
        this.bufferStore = bufferStore;
        this.textureStore = textureStore;
        this.quad = GeometryBuilder.screenQuad();
        this.clearColor = DEFAULT_CLEAR_COLOR;
        this.needsRecreateRenderPass = true;
        this.GlobalValues = GlobalValues;
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