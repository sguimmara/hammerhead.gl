class ShaderStore {
    device: GPUDevice;
    modules: Map<number, GPUShaderModule>
    constructor(device: GPUDevice) {
        this.device = device;
        this.modules = new Map<number, GPUShaderModule>();
    }

    store(id: number, code: string) {
        const shaderModule = this.device.createShaderModule({
            label: `${id}`,
            code,
        });

        this.modules.set(id, shaderModule);
    }

    get(id: number): GPUShaderModule {
        return this.modules.get(id);
    }
}

export default ShaderStore;
