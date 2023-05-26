class ShaderStore {
    device: GPUDevice;
    modules: Map<string, GPUShaderModule>
    constructor(device: GPUDevice) {
        this.device = device;
        this.modules = new Map<string, GPUShaderModule>();
    }

    store(id: string, code: string) {
        const shaderModule = this.device.createShaderModule({
            label: id,
            code,
        });

        this.modules.set(id, shaderModule);
    }

    get(id: string): GPUShaderModule {
        return this.modules.get(id);
    }
}

export default ShaderStore;
