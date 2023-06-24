import { Service } from "@/core";
import { AddressMode, FilterMode, Sampler, Source, Texture } from "@/textures";

type GPUImage =
    | ImageBitmap
    | HTMLVideoElement
    | HTMLCanvasElement
    | OffscreenCanvas;

/**
 * Manages WebGPU textures.
 */
class TextureStore implements Service {
    private readonly textures: Map<
        number,
        { texture: GPUTexture; defaultView: GPUTextureView }
    >;
    private readonly device: GPUDevice;
    private readonly emptyTexture: GPUTexture;
    private readonly samplers = new Map<string, GPUSampler>();
    private readonly emptyTextureView: GPUTextureView;

    constructor(device: GPUDevice) {
        this.textures = new Map();
        this.device = device;
        this.samplers = new Map();
        this.emptyTexture = device.createTexture({
            label: "empty texture",
            dimension: "2d",
            format: "rgba8unorm",
            size: [1, 1],
            usage:
                GPUTextureUsage.COPY_SRC |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.TEXTURE_BINDING,
        });
        this.emptyTextureView = this.emptyTexture.createView();
        const white = new Uint8ClampedArray(4);
        white.set([255, 255, 255, 255]);
        this.updateTextureFromBufferSource(white, this.emptyTexture);
    }

    getType(): string {
        return "TextureStore";
    }

    destroy() {
        this.textures.forEach((t) => {
            t.texture.destroy();
        });
        this.textures.clear();
    }

    private createSampler(sampler: Sampler): GPUSampler {
        return this.device.createSampler({
            magFilter: sampler.magFilter,
            minFilter: sampler.minFilter,
            addressModeU: sampler.addressModeU,
            addressModeV: sampler.addressModeV,
        });
    }

    getOrCreateSampler(value: Sampler): GPUSampler {
        const key = value.magFilter + value.minFilter + value.addressModeU + value.addressModeV;

        if (!this.samplers.has(key)) {
            const sampler = this.createSampler(value);
            this.samplers.set(key, sampler);
            return sampler;
        }
        return this.samplers.get(key);
    }

    get textureCount(): number {
        return this.textures.size;
    }

    /**
     * Updates a GPUTexture from a CPU buffer.
     * @param buf The CPU buffer.
     * @param dst The GPUTexture.
     */
    private updateTextureFromBufferSource(buf: BufferSource, dst: GPUTexture) {
        this.device.queue.writeTexture(
            { texture: dst },
            buf,
            { bytesPerRow: dst.width * 4 },
            { width: dst.width, height: dst.height }
        );
    }

    /**
     * Updates a GPUTexture from a GPU image.
     * @param source The image source.
     * @param dst The GPUTexture.
     */
    private updateTextureFromGPUImage(source: Source, dst: GPUTexture) {
        this.device.queue.copyExternalImageToTexture(
            { source: source.getImage() as GPUImage, flipY: source.flipY },
            { texture: dst },
            [source.width, source.height]
        );
    }

    private writeTexture(source: Source, texture: GPUTexture) {
        if (source.isGPUImage) {
            this.updateTextureFromGPUImage(source, texture);
        } else {
            const data = source.getImage();
            this.updateTextureFromBufferSource(data as BufferSource, texture);
        }
    }

    getOrCreateTexture(texture: Texture): {
        texture: GPUTexture;
        defaultView: GPUTextureView;
    } {
        if (texture == null) {
            return {
                texture: this.emptyTexture,
                defaultView: this.emptyTextureView,
            };
        }

        if (this.textures.has(texture.id)) {
            return this.textures.get(texture.id);
        }

        texture.on("destroy", () => this.onTextureDestroyed(texture));

        let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;
        if (texture.source.isGPUImage) {
            usage |= GPUTextureUsage.RENDER_ATTACHMENT;
        }

        const source = texture.source;
        const gpuTexture = this.device.createTexture({
            size: [source.width, source.height],
            format: texture.format,
            label: texture.label,
            usage,
        });

        const result = {
            texture: gpuTexture,
            defaultView: gpuTexture.createView(),
        };
        this.textures.set(texture.id, result);

        // TODO Support versioned textures
        this.writeTexture(source, gpuTexture);

        return result;
    }

    onTextureDestroyed(texture: Texture): void {
        const entry = this.textures.get(texture.id);
        if (entry) {
            entry.texture.destroy();
            this.textures.delete(texture.id);
        }
    }
}

export default TextureStore;
