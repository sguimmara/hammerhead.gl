import { Visitor } from "../Visitable";
import Vec4 from "../Vec4";
import BufferUniform from "./BufferUniform";
import { Color } from "chroma-js";

export default class Vec4Uniform extends BufferUniform {
    value: Vec4;

    constructor(vec4: Vec4 = Vec4.zero) {
        super();
        this.value = vec4;
    }

    fromColor(color: Color) {
        this.value = Vec4.fromColor(color);
    }

    getByteSize(): number {
        return 16;
    }

    visit(visitor: Visitor): void {
        visitor.visitVec4(this.value);
    }
}
