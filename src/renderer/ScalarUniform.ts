import { Visitor } from "../Visitable";
import BufferUniform from "./BufferUniform";

export default class ScalarUniform extends BufferUniform {
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
