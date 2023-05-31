import { Visitor } from "../Visitable";
import Vec2 from "../Vec2";
import BufferUniform from "./BufferUniform";

export default class Vec2Uniform extends BufferUniform {
    vec2: Vec2;

    constructor(vec2: Vec2) {
        super();
        this.vec2 = vec2;
    }

    getByteSize(): number {
        return 8;
    }

    visit(visitor: Visitor): void {
        visitor.visitVec2(this.vec2);
    }
}
