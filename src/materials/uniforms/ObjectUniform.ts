import Sized from "../../core/Sized";
import { Visitable, Visitor } from "../../core/Visitable";
import BufferUniform from "./BufferUniform";

type ObjectValue = Sized & Visitable;

/**
 * A uniform type for arbitrary objects.
 */
export default class ObjectUniform extends BufferUniform {
    value: ObjectValue;

    constructor(value: ObjectValue) {
        super();
        this.value = value;
    }

    getByteSize(): number {
        return this.value.getByteSize();
    }

    visit(visitor: Visitor): void {
        this.value.visit(visitor);
    }
};