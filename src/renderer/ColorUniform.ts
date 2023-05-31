import { Color } from "chroma-js";
import { Visitor } from "../Visitable";
import BufferUniform from "./BufferUniform";

export default class ColorUniform extends BufferUniform {
    color: Color;

    constructor(color: Color) {
        super();
        this.color = color;
    }

    getByteSize(): number {
        return 4 * 4;
    }

    visit(visitor: Visitor): void {
        const [r, g, b, a] = this.color.gl();
        visitor.visitNumber(r);
        visitor.visitNumber(g);
        visitor.visitNumber(b);
        visitor.visitNumber(a);
    }
}
