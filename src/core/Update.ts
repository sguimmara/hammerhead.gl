/**
 * Trait for objects that can be periodically updated.
 */
export interface Update {
    /**
     * Updates this object.
     */
    update(): void;
}