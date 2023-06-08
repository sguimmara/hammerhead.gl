/**
 * Trait for objects that can be periodically updated.
 */
export default interface Update {
    /**
     * Updates this object.
     */
    update(): void;
}