import WebGPURenderer from "./renderer/WebGPURenderer";

class Context {
    private readonly context: GPUCanvasContext;

    readonly device: GPUDevice;
    readonly renderer: WebGPURenderer;

    private constructor(context: GPUCanvasContext, device: GPUDevice) {
        this.context = context;
        this.device = device;
        this.renderer = new WebGPURenderer(this.device, this.context);
    }

    destroy() {
        this.renderer.destroy();
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

        return new Context(context, device);
    }
}

export default Context;
