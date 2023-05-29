import Texture from "../textures/Texture";

class TextureStore {
    private readonly textures: Map<number, { gpuTexture: GPUTexture, sampler: GPUSampler, view: GPUTextureView }>;
    private readonly device: GPUDevice;

    constructor(device: GPUDevice) {
        this.textures = new Map();
        this.device = device;
    }

    destroy() {
        this.textures.forEach(t => {
            t.gpuTexture.destroy();
        });
        this.textures.clear();
    }

    getTexture(texture: Texture): { gpuTexture: GPUTexture; sampler: GPUSampler; view: GPUTextureView; } {
        if (this.textures.has(texture.id)) {
            return this.textures.get(texture.id);
        }

        const gpuTexture = this.device.createTexture({
            size: [texture.width, texture.height],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });

        const sampler = this.device.createSampler({
            magFilter: "linear",
        });

        const result = { gpuTexture, sampler, view: gpuTexture.createView() };

        this.textures.set(texture.id, result);

        this.device.queue.writeTexture(
            { texture: gpuTexture },
            texture.getData(),
            { bytesPerRow: texture.width * 4 },
            { width: texture.width, height: texture.height });

        return result;
    }
}

export default TextureStore;