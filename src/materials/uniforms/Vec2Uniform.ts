import { Visitor } from "../../core/Visitable";
import { Vec2 } from "../../index";
import BufferUniform from "./BufferUniform";

export default class Vec2Uniform extends BufferUniform {
    value: Vec2;

    constructor(vec2: Vec2 = new Vec2(0, 0)) {
        super();
        this.value = vec2;
    }

    getByteSize(): number {
        return 8;
    }

    visit(visitor: Visitor): void {
        visitor.visitVec2(this.value);
    }
}
