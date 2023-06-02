import { Visitor } from "../../core/Visitable";
import { Vec4 } from "../../index";
import BufferUniform from "./BufferUniform";
import { Color } from "chroma-js";

export default class Vec4Uniform extends BufferUniform {
    value: Vec4;

    constructor(vec4: Vec4 = new Vec4(0, 0, 0, 0)) {
        super();
        this.value = vec4;
    }

    fromColor(color: Color) {
        const [r, g, b, a] = color.gl();
        this.value = new Vec4(r, g, b, a);
    }

    getByteSize(): number {
        return 16;
    }

    visit(visitor: Visitor): void {
        visitor.visitVec4(this.value);
    }
}
