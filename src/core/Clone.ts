/**
 * Traits for objects that can be cloned.
 */
export default interface Destroy {
    /**
     * Clones this object.
     */
    clone(): unknown;
}