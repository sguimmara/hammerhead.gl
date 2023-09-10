import { Service } from './Service';

export default class Configuration implements Service {
    readonly depthBufferFormat: GPUTextureFormat;

    constructor(options : {
        depthBufferFormat: GPUTextureFormat
    }= {
        depthBufferFormat: 'depth32float',
    }) {
        this.depthBufferFormat = options.depthBufferFormat;
    }

    getType(): string {
        return 'Configuration';
    }

    destroy(): void {
    }

    static get default() {
        return new Configuration();
    }
}
