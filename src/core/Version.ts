/**
 * Traits for objects that can change over time.
 */
export default interface Version {
    getVersion(): number;
}