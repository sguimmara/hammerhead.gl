/**
 * Trait for objects that can change over time.
 */
export interface Version {
    getVersion(): number;
    incrementVersion(): void;
}

/**
 * Wraps a type and version it.
 * @example
 *
 * const foo = new MyType();
 * const versioned = new Versioned<MyType>(foo);
 *
 * const currentVersion = versioned.getVersion();
 */
export class Versioned<T> implements Version {
    value: T;
    private version: number;

    constructor(value: T) {
        this.value = value;
        this.version = 0;
    }

    setVersion(v: number) {
        this.version = v;
    }

    incrementVersion(): void {
        this.version++;
    }

    getVersion(): number {
        return this.version;
    }
}
