import chroma, { Color } from "chroma-js";
import BufferGeometry from "../../geometries/BufferGeometry";
import GeometryBuilder from "../../geometries/GeometryBuilder";
import BufferStore from "../BufferStore";
import ShaderStore from "../ShaderStore";
import TextureStore from "../TextureStore";

const DEFAULT_CLEAR_COLOR = chroma('black');

abstract class Stage {
    protected readonly device: GPUDevice;
    protected readonly shaderStore: ShaderStore;
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

    constructor(
        device: GPUDevice,
        bufferStore: BufferStore,
        shaderStore: ShaderStore,
        textureStore: TextureStore
    ) {
        this.device = device;
        this.shaderStore = shaderStore;
        this.bufferStore = bufferStore;
        this.textureStore = textureStore;
        this.quad = GeometryBuilder.screenQuad();
        this.clearColor = DEFAULT_CLEAR_COLOR;
    }

    withClearColor(color: Color) {
        this.clearColor = color;
        return this;
    }

    getOutput() {
        return this.output;
    }

    withOutput(output: GPUTexture) {
        if (this.output != output) {
            this.output = output;
            this.outputView = output.createView();
            const colorAttachment: GPURenderPassColorAttachment = {
                view: this.outputView,
                loadOp: 'clear',
                storeOp: 'store'
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

    execute(encoder: GPUCommandEncoder) {
        // Implement in derived classes
    }
}

export default Stage;