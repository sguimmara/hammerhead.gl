/**
 * Trait for object that provides a size in bytes.
 */
export interface Sized {
    /**
     * Gets the size in bytes of this object.
     */
    getByteSize(): number;
}
