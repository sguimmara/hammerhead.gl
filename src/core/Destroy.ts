/**
 * Trait for objects that hold unmanaged memory.
 */
export interface Destroy {
    /**
     * Release unmanaged memory.
     */
    destroy(): void;
}