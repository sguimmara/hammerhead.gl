import { Sized, Visitable, Version, Visitor } from '@/core';
import BufferUniform from './BufferUniform';

type ObjectValue = Sized & Visitable & Version;

/**
 * A uniform type for arbitrary objects.
 */
export default class ObjectUniform extends BufferUniform<ObjectValue> {
    value: ObjectValue;

    constructor(value: ObjectValue) {
        super();
        this.value = value;
    }

    getVersion(): number {
        return this.value.getVersion();
    }

    getByteSize(): number {
        return this.value.getByteSize();
    }

    visit(visitor: Visitor): void {
        this.value.visit(visitor);
    }
}
