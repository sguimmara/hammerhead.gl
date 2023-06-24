import { Container, Observable, EventDispatcher, EventHandler } from "@/core";
import {
    BufferStore,
    PipelineManager,
    Renderer,
    TextureStore,
} from "@/renderer";
import MemoryManager from "@/renderer/MemoryManager";
import Configuration from "./Configuration";

export type ContextEvents = 'resized';

/**
 * The WebGPU context.
 * @fires resized When the canvas is resized.
 */
export default class Context implements Observable<ContextEvents> {
    private readonly context: GPUCanvasContext;
    private readonly bufferStore: BufferStore;
    private readonly textureStore: TextureStore;
    private readonly dispatcher: EventDispatcher<Context, ContextEvents>;

    readonly container: Container;
    readonly device: GPUDevice;
    readonly renderer: Renderer;
    readonly memoryManager: MemoryManager;
    readonly configuration: Configuration;

    private constructor(
        context: GPUCanvasContext,
        device: GPUDevice,
        canvas: HTMLCanvasElement,
        configuration: Configuration,
    ) {
        this.context = context;
        this.device = device;
        this.configuration = configuration;
        this.dispatcher = new EventDispatcher<Context, ContextEvents>(this);

        this.container = new Container();
        this.memoryManager = new MemoryManager(device);
        this.bufferStore = new BufferStore(device, this.memoryManager);
        this.textureStore = new TextureStore(device);

        this.container.register(this.configuration);
        this.container.register(this.bufferStore);
        this.container.register(this.textureStore);
        this.container.register(new PipelineManager(device, this.container));
        this.container.register(this.memoryManager);

        this.renderer = new Renderer(this.device, this.context, this.container);

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const canvas = entry.target as HTMLCanvasElement;
                const width = entry.contentBoxSize[0].inlineSize;
                const height = entry.contentBoxSize[0].blockSize;
                canvas.width = Math.min(
                    width,
                    this.device.limits.maxTextureDimension2D
                );
                canvas.height = Math.min(
                    height,
                    this.device.limits.maxTextureDimension2D
                );
                this.dispatcher.dispatch("resized");
            }
        });

        observer.observe(canvas);
    }

    on(type: ContextEvents, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    destroy() {
        this.container.destroy();
        this.renderer.destroy();
    }

    /**
     * Creates a context on the specified canvas.
     * @param canvas The canvas.
     */
    static async create(canvas: HTMLCanvasElement, configuration?: Configuration): Promise<Context> {
        const context = canvas.getContext("webgpu");
        const adapter = await navigator.gpu?.requestAdapter();
        const device = await adapter?.requestDevice();
        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device,
            format,
        });
        if (device == null) {
            throw new Error("WebGPU is not supported on this browser.");
        }

        return new Context(context, device, canvas, configuration ?? Configuration.default);
    }
}
