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
    private readonly samplers = new Map<number, GPUSampler>();
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
        function toFilter(mode: FilterMode): GPUFilterMode {
            switch (mode) {
                case FilterMode.Linear:
                    return "linear";
                case FilterMode.Nearest:
                    return "nearest";
                default:
                    throw new Error("invalid filter mode");
            }
        }

        function toAddressMode(mode: AddressMode): GPUAddressMode {
            switch (mode) {
                case AddressMode.ClampToEdge:
                    return "clamp-to-edge";
                case AddressMode.Repeat:
                    return "repeat";
                case AddressMode.Mirror:
                    return "mirror-repeat";
                default:
                    throw new Error("invalid address mod");
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
        const code =
            (value.magFilter << 2) |
            (value.addressModeU << 1) |
            value.addressModeV;
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
     * @param source The GPU image.
     * @param dst The GPUTexture.
     */
    private updateTextureFromGPUImage(source: GPUImage, dst: GPUTexture) {
        this.device.queue.copyExternalImageToTexture(
            { source, flipY: false }, // TODO expose flipy
            { texture: dst },
            [source.width, source.height]
        );
    }

    private writeTexture(source: Source, texture: GPUTexture) {
        const data = source.getImage();
        if (source.isGPUImage) {
            this.updateTextureFromGPUImage(data as GPUImage, texture);
        } else {
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
            format: "rgba8unorm", // TODO expose from texture (see the gltf spec that mandates sRGB for albedo)
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
