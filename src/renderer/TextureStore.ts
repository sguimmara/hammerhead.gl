import Texture from "../textures/Texture";

class TextureStore implements Service {
    readonly type: string = 'TextureStore';

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

    getTextureCount(): number {
        return this.textures.size;
    }

    getOrCreateTexture(texture: Texture): { gpuTexture: GPUTexture; sampler: GPUSampler; view: GPUTextureView; } {
        if (this.textures.has(texture.id)) {
            return this.textures.get(texture.id);
        }

        texture.on('destroy', () => this.onTextureDestroyed(texture));

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
            texture.data,
            { bytesPerRow: texture.width * 4 },
            { width: texture.width, height: texture.height });

        return result;
    }

    onTextureDestroyed(texture: Texture): void {
        const entry = this.textures.get(texture.id);
        if (entry) {
            entry.gpuTexture.destroy();
            this.textures.delete(texture.id);
        }
    }
}

export default TextureStore;