/**
 * Traits for objects that hold unmanaged memory.
 */
interface Destroy {
    /**
     * Release unmanaged memory.
     */
    destroy(): void;
}