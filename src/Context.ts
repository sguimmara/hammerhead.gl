import Container from "./Container";
import { EventDispatcher, EventHandler, Observable } from "./EventDispatcher";
import BufferStore from "./renderer/BufferStore";
import PipelineManager from "./renderer/PipelineManager";
import TextureStore from "./renderer/TextureStore";
import WebGPURenderer from "./renderer/WebGPURenderer";

class ContextInfo {
    buffers: number;
    textures: number;
}

/**
 * The WebGPU context.
 * @fires resized When the canvas is resized.
 */
class Context implements Observable {
    private readonly context: GPUCanvasContext;
    private readonly container: Container;
    private readonly bufferStore: BufferStore;
    private readonly textureStore: TextureStore;
    private readonly dispatcher: EventDispatcher<Context>;

    readonly device: GPUDevice;
    readonly renderer: WebGPURenderer;

    private constructor(context: GPUCanvasContext, device: GPUDevice, canvas: HTMLCanvasElement) {
        this.context = context;
        this.device = device;
        this.dispatcher = new EventDispatcher<Context>(this);

        this.container = new Container();
        this.bufferStore = new BufferStore(device);
        this.textureStore = new TextureStore(device);

        this.container.register(this.bufferStore);
        this.container.register(this.textureStore);
        this.container.register(new PipelineManager(device, this.container));

        this.renderer = new WebGPURenderer(this.device, this.context, this.container);

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const canvas = entry.target as HTMLCanvasElement;
                const width = entry.contentBoxSize[0].inlineSize;
                const height = entry.contentBoxSize[0].blockSize;
                canvas.width = Math.min(width, this.device.limits.maxTextureDimension2D);
                canvas.height = Math.min(height, this.device.limits.maxTextureDimension2D);
                this.dispatcher.dispatch('resized');
            }
        });

        observer.observe(canvas);
    }

    on(type: string, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    getInfo(): ContextInfo {
        const info = new ContextInfo();

        info.buffers = this.bufferStore.getBufferCount();
        info.textures = this.textureStore.getTextureCount();

        return info;
    }

    destroy() {
        this.container.destroy();
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

        return new Context(context, device, canvas);
    }
}

export default Context;
