import { Visitor } from "../../core/Visitable";
import BufferUniform from "./BufferUniform";

/**
 * Uniform that holds a single number.
 */
export default class ScalarUniform extends BufferUniform<number> {
    value: number;

    constructor(value?: number) {
        super();
        this.value = value;
    }

    getByteSize(): number {
        return 4;
    }

    visit(visitor: Visitor): void {
        visitor.visitNumber(this.value);
    }
}
