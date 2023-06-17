/**
 * A texture source. Provides data to fill the pixel buffer.
 */
export default interface Source {
    /**
     * Gets the pixel buffer.
     */
    getData(): BufferSource;

    /**
     * The width, in pixels.
     */
    get width(): number;

    /**
     * The height, in pixels.
     */
    get height(): number;
}
