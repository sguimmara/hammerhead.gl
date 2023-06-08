/**
 * Traits for objects that can change over time.
 */
export default interface Version {
    getVersion(): number;
    incrementVersion(): void;
}

export class Versioned<T> implements Version {
    value: T;
    private version: number;

    constructor(value: T) {
        this.value = value;
        this.version = 0;
    }

    incrementVersion(): void {
        this.version++;
    }

    getVersion(): number {
        return this.version;
    }
}