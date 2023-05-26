import chroma, { Color } from "chroma-js";

import triangle from './shaders/triangle.wgsl';
import triangleRgb from './shaders/triangle-rgb.wgsl';
import ShaderStore from "./ShaderStore";

class Context {
    canvas: HTMLCanvasElement;

    context: GPUCanvasContext;
    device: GPUDevice;
    view: GPUTextureView;

    shaderStore: ShaderStore;

    constructor(canvas: HTMLCanvasElement, context: GPUCanvasContext, device: GPUDevice) {
        this.canvas = canvas;
        this.context = context;
        this.device = device;

        this.shaderStore = new ShaderStore(device);

        this.shaderStore.store('triangle', triangle);
        this.shaderStore.store('triangle-rgb', triangleRgb);
    }

    private createRenderPipeline(shaderId: string) {
        const shaderModule = this.shaderStore.get(shaderId);
        if (!shaderModule) {
            throw new Error(`no shader module found with id ${shaderId}`);
        }

        const target: GPUColorTargetState = {
            format: navigator.gpu.getPreferredCanvasFormat(), // TODO save
        };

        return this.device.createRenderPipeline({
            label: `pipeline for '${shaderId}'`,
            layout: 'auto',
            vertex: {
                module: shaderModule,
                entryPoint: 'vs',
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fs',
                targets: [target]
            }
        });
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

    renderTriangle() {
        const clearColor = chroma('pink');

        const { pass, encoder } = this.beginCanvasPass({ clearColor });

        pass.setPipeline(this.createRenderPipeline('triangle'));
        pass.draw(3);

        pass.end();

        const cmdBuf = encoder.finish();

        this.device.queue.submit([cmdBuf]);
    }

    renderTriangleRgb() {
        const clearColor = chroma('pink');

        const { pass, encoder } = this.beginCanvasPass({ clearColor });

        pass.setPipeline(this.createRenderPipeline('triangle-rgb'));
        pass.draw(3);

        pass.end();

        const cmdBuf = encoder.finish();

        this.device.queue.submit([cmdBuf]);
    }

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
