/**
 * Traits for objects that can be cloned.
 */
export interface Clone {
    /**
     * Performs a shallow clone of this object.
     */
    clone(): unknown;
}
