import Texture from "../textures/Texture";

class  TextureStore {
    private readonly textures: Map<number, GPUTexture>;
    private readonly device: GPUDevice;

    constructor(device: GPUDevice) {
        this.textures = new Map();
        this.device = device;
    }

    getTexture(texture: Texture) {
        if (this.textures.has(texture.id)) {
            return this.textures.get(texture.id);
        }

        const gpuTexture = this.device.createTexture({
            size: [texture.width, texture.height],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });

        this.textures.set(texture.id, gpuTexture);

        this.device.queue.writeTexture(
            { texture: gpuTexture },
            texture.getData(),
            { bytesPerRow: texture.width * 4 },
            { width: texture.width, height: texture.height });

        return gpuTexture;
    }
}

export default TextureStore;