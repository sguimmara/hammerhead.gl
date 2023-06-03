import Service from "../core/Service";
import Sampler, { FilterMode, AddressMode } from "../textures/Sampler";
import Texture from "../textures/Texture";

class TextureStore implements Service {
    readonly type: string = 'TextureStore';

    private readonly textures: Map<number, GPUTexture>;
    private readonly device: GPUDevice;
    private readonly emptyTexture: GPUTexture;
    private readonly samplers = new Map<number, GPUSampler>;

    constructor(device: GPUDevice) {
        this.textures = new Map();
        this.device = device;
        this.samplers = new Map();
        this.emptyTexture = device.createTexture({
            label: 'empty texture',
            dimension: '2d',
            format: 'rgba8unorm',
            size: [1, 1],
            usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING
        });
        const white = new Uint8ClampedArray(4);
        white.set([255, 255, 255, 255]);
        this.updateTexture(white,  this.emptyTexture);
    }

    destroy() {
        this.textures.forEach(t => {
            t.destroy();
        });
        this.textures.clear();
    }

    private createSampler(sampler: Sampler): GPUSampler {
        function toFilter(mode: FilterMode): GPUFilterMode {
            switch (mode) {
                case FilterMode.Linear: return 'linear';
                case FilterMode.Nearest: return 'nearest';
                default: throw new Error('invalid filter mode');
            }
        }

        function toAddressMode(mode: AddressMode): GPUAddressMode {
            switch (mode) {
                case AddressMode.ClampToEdge: return 'clamp-to-edge';
                case AddressMode.Repeat: return 'repeat';
                case AddressMode.Mirror: return 'mirror-repeat';
                default: throw new Error('invalid address mod');
            }
        }

        return this.device.createSampler({
            magFilter: toFilter(sampler.magFilter),
            minFilter: toFilter(sampler.minFilter),
            addressModeU: toAddressMode(sampler.addressModeU),
            addressModeV: toAddressMode(sampler.addressModeV),
        });
    }

    getOrCreateSampler(value: Sampler): GPUSampler {
        const code = value.magFilter << 2 | value.addressModeU << 1 | value.addressModeV;
        if (!this.samplers.has(code)) {
            const sampler = this.createSampler(value);
            this.samplers.set(code, sampler);
            return sampler;
        }
        return this.samplers.get(code);
    }

    getTextureCount(): number {
        return this.textures.size;
    }

    private updateTexture(data: BufferSource | SharedArrayBuffer, dst: GPUTexture) {
        this.device.queue.writeTexture(
            { texture: dst },
            data,
            { bytesPerRow: dst.width * 4 },
            { width: dst.width, height: dst.height }
        );

    }

    getOrCreateTexture(texture: Texture): GPUTexture {
        if (texture == null) {
            return this.emptyTexture;
        }

        if (this.textures.has(texture.id)) {
            return this.textures.get(texture.id);
        }

        texture.on('destroy', () => this.onTextureDestroyed(texture));

        const gpuTexture = this.device.createTexture({
            size: [texture.width, texture.height],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });

        this.textures.set(texture.id, gpuTexture);

        this.updateTexture(texture.data, gpuTexture);

        return gpuTexture;
    }

    onTextureDestroyed(texture: Texture): void {
        const entry = this.textures.get(texture.id);
        if (entry) {
            entry.destroy();
            this.textures.delete(texture.id);
        }
    }
}

export default TextureStore;