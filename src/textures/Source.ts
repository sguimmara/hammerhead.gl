export type TextureData =
    | BufferSource
    | ImageBitmap
    | HTMLCanvasElement
    | OffscreenCanvas;

/**
 * A texture source. Provides data to fill the pixel buffer.
 */
export default interface Source {
    /**
     * Gets the image.
     */
    getImage(): TextureData;

    /**
     * Indicates that the image produced by this source exists in GPU memory (e.g an ImageBitmap)
     * Otherwise, it comes from CPU memory (e.g an ArrayBuffer).
     */
    isGPUImage: boolean;

    /**
     * The width, in pixels.
     */
    get width(): number;

    /**
     * The height, in pixels.
     */
    get height(): number;
}
