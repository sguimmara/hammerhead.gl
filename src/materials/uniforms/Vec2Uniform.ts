import { Visitor } from "@/core";
import { Vec2, vec2 } from "wgpu-matrix";
import BufferUniform from "./BufferUniform";

/**
 * Uniform that holds a {@link Vec2}
 */
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
