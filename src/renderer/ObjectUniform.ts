import Sized from "../Sized";
import { Visitable, Visitor } from "../Visitable";
import BufferUniform from "./BufferUniform";

type ObjectValue = Sized & Visitable;

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