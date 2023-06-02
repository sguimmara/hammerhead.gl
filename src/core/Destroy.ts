/**
 * Traits for objects that hold unmanaged memory.
 */
export default interface Destroy {
    /**
     * Release unmanaged memory.
     */
    destroy(): void;
}