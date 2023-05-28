import chroma, { Color } from "chroma-js";

import ShaderStore from "./renderer/ShaderStore";
import WebGPURenderer from "./renderer/WebGPURenderer";

class Context {
    canvas: HTMLCanvasElement;

    context: GPUCanvasContext;
    device: GPUDevice;
    view: GPUTextureView;

    shaderStore: ShaderStore;
    renderer: WebGPURenderer;

    constructor(canvas: HTMLCanvasElement, context: GPUCanvasContext, device: GPUDevice) {
        this.canvas = canvas;
        this.context = context;
        this.device = device;
        this.shaderStore = new ShaderStore(device);

        this.renderer = new WebGPURenderer(this.device, this.shaderStore, this.context);
    }

    private beginCanvasPass(options: { clearColor: Color }) {
        const encoder = this.device.createCommandEncoder({ label: 'clear-encoder' });
        const colorAttachment: GPURenderPassColorAttachment = {
            view: this.context.getCurrentTexture().createView(),
            clearValue: options.clearColor.gl(),
            loadOp: 'clear',
            storeOp: 'store'
        };
        const renderPassDescriptor: GPURenderPassDescriptor = {
            label: 'clear renderPass',
            colorAttachments: [colorAttachment]
        }

        const pass = encoder.beginRenderPass(renderPassDescriptor);

        return { pass, encoder };
    }

    // renderTriangleUniform() {
    //     const uniformBufsize =
    //         4 * 4 +
    //         2 * 4 +
    //         2 * 4;
    //     const uniformBuf = this.device.createBuffer({
    //         size: uniformBufsize,
    //         usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    //     });

    //     const uniformValues = new Float32Array(uniformBufsize / 4);
    //     uniformValues.set([0, 1, 0, 1], 0);
    //     uniformValues.set([1, 1.2], 4);
    //     uniformValues.set([0, 0.3], 6);

    //     const pipeline = this.createRenderPipeline('triangle-uniforms');
    //     const bindGroup = this.device.createBindGroup({
    //         layout: pipeline.getBindGroupLayout(0),
    //         entries: [
    //             { binding: 0, resource: { buffer: uniformBuf }}
    //         ]
    //     });

    //     this.device.queue.writeBuffer(uniformBuf, 0, uniformValues);

    //     const { pass, encoder } = this.beginCanvasPass({ clearColor: chroma('black') });

    //     pass.setPipeline(pipeline);
    //     pass.setBindGroup(0, bindGroup);
    //     pass.draw(3);
    //     pass.end();

    //     this.device.queue.submit([encoder.finish()]);
    // }

    // renderTriangleRgb() {
    //     const clearColor = chroma('pink');

    //     const { pass, encoder } = this.beginCanvasPass({ clearColor });

    //     pass.setPipeline(this.createRenderPipeline('triangle-rgb'));
    //     pass.draw(3);

    //     pass.end();

    //     const cmdBuf = encoder.finish();

    //     this.device.queue.submit([cmdBuf]);
    // }

    /**
     * Clears the canvas.
     * @param clearColor The clear color.
     */
    clearCanvas(clearColor: Color) {
        const { pass, encoder } = this.beginCanvasPass({ clearColor });

        pass.end();

        const cmdBuf = encoder.finish();

        this.device.queue.submit([cmdBuf]);
    }

    /**
     * Creates a context on the specified canvas.
     * @param canvas The canvas.
     */
    static async create(canvas: HTMLCanvasElement): Promise<Context> {
        const context = canvas.getContext('webgpu');
        const adapter = await navigator.gpu?.requestAdapter();
        const device = await adapter?.requestDevice();
        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device,
            format,
        });
        if (device == null) {
            throw new Error('WebGPU is not supported on this browser.');
        }

        return new Context(canvas, context, device);
    }
}

export default Context;
