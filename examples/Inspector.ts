import { Context } from 'hammerhead.gl/core';
import { BufferStore, TextureStore } from 'hammerhead.gl/renderer';
import { FolderApi, Pane } from 'tweakpane';

export default class Inspector {
    private readonly bufferStore: BufferStore;
    private readonly textureStore: TextureStore;
    private readonly context: Context;
    readonly pane: Pane;
    readonly exampleFolder: FolderApi;

    constructor(context: Context) {
        this.context = context;
        const container = context.container;
        this.bufferStore = container.get<BufferStore>('BufferStore');
        this.textureStore = container.get<TextureStore>('TextureStore');

        this.pane = new Pane();

        this.addGeneralFolder(this.pane);
        this.addBufferFolder(this.pane);
        this.addTextureFolder(this.pane);

        this.exampleFolder = this.pane.addFolder({
            title: 'example',
            expanded: true
        });
    }

    addGeneralFolder(pane: Pane) {
        const folder = pane.addFolder({
            title: 'device',
            expanded: false,
        });

        const limits = this.context.device.limits;

        function num(key: keyof GPUSupportedLimits) {
            folder.addMonitor(limits, key, {
                format: n => n.toFixed(0),
            });
        }
        const renderer = this.context.renderer;
        folder.addMonitor(renderer, 'frameCount', {
            label: 'frames',
            format: n => n.toFixed(0)
        });
        num('maxVertexBuffers');
        num('maxUniformBufferBindingSize');
    }

    addTextureFolder(pane: Pane) {
        const folder = pane.addFolder({
            title: 'textures',
            expanded: false,
        });

        folder.addMonitor(this.textureStore, 'textureCount', {
            label: 'count',
            format: n => n.toFixed(0)
        });
    }

    dispose() {
        this.pane.dispose();
        this.pane.element.remove();
    }

    addBufferFolder(pane: Pane) {
        const bufferFolder = pane.addFolder({
            title: 'buffers',
            expanded: false,
        });

        const bufferParams = this.bufferStore.getStats();
        bufferFolder.addMonitor(bufferParams, 'bufferCount', {
            format: n => n.toFixed(0),
            label: 'GPU buffers',
        });
        bufferFolder.addMonitor(bufferParams, 'bufferMemoryBytes', {
            format: n => {
                const kb = (n / 1024).toFixed(1);
                return `${n.toFixed(0)} B (${kb} KB)`;
            } ,
            view: 'graph',
            min: 0,
            max: 10 * 1024 * 1024,
            label: 'memory'
        });
    }
}
