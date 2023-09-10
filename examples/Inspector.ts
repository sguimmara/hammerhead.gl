import { Context } from 'hammerhead.gl/core';
import { BufferStore, TextureStore } from 'hammerhead.gl/renderer';
import { Pane } from 'tweakpane';

export default class Inspector {
    private readonly bufferStore: BufferStore;
    private readonly textureStore: TextureStore;
    private readonly context: Context;

    constructor(context: Context) {
        this.context = context;
        const container = context.container;
        this.bufferStore = container.get<BufferStore>('BufferStore');
        this.textureStore = container.get<TextureStore>('TextureStore');

        const pane = new Pane();

        this.addGeneralFolder(pane);
        this.addBufferFolder(pane);
        this.addTextureFolder(pane);
    }

    addGeneralFolder(pane: Pane) {
        const folder = pane.addFolder({
            title: 'device'
        });

        const limits = this.context.device.limits;

        function num(key: keyof GPUSupportedLimits) {
            folder.addMonitor(limits, key, {
                format: n => n.toFixed(0),
            });
        }
        num('maxVertexBuffers');
        num('maxUniformBufferBindingSize');
    }

    addTextureFolder(pane: Pane) {
        const folder = pane.addFolder({
            title: 'textures',
        });

        folder.addMonitor(this.textureStore, 'textureCount', {
            label: 'count',
            format: n => n.toFixed(0)
        });
    }

    addBufferFolder(pane: Pane) {
        const bufferFolder = pane.addFolder({
            title: 'buffers',
        });

        const bufferParams = this.bufferStore.getStats();
        bufferFolder.addMonitor(bufferParams, 'bufferCount', {
            format: n => n.toFixed(0),
            label: 'GPUBuffers',
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
