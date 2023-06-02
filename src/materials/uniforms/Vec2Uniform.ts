import { Vec2, vec2 } from "wgpu-matrix";
import { Visitor } from "../../core/Visitable";
import BufferUniform from "./BufferUniform";

export default class Vec2Uniform extends BufferUniform {
    value: Vec2;

    constructor(v: Vec2 = vec2.create(0, 0)) {
        super();
        this.value = v;
    }

    getByteSize(): number {
        return 8;
    }

    visit(visitor: Visitor): void {
        visitor.visitVec2(this.value);
    }
}
