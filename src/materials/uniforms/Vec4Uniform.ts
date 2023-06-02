import { Color } from "chroma-js";
import { Vec4, vec4 } from "wgpu-matrix";
import { Visitor } from "../../core/Visitable";
import BufferUniform from "./BufferUniform";

export default class Vec4Uniform extends BufferUniform {
    value: Vec4;

    constructor(v: Vec4 = vec4.create(0, 0, 0, 0)) {
        super();
        this.value = v;
    }

    fromColor(color: Color) {
        const [r, g, b, a] = color.gl();
        this.value = vec4.create(r, g, b, a);
    }

    getByteSize(): number {
        return 16;
    }

    visit(visitor: Visitor): void {
        visitor.visitVec4(this.value);
    }
}
