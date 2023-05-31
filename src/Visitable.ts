import { Color } from "chroma-js";
import Vec2 from "./Vec2";
import Vec4 from "./Vec4";

/**
 * Visitor.
 */
interface Visitor {
    visitNumber(number: number): void;
    visitVec2(vec2: Vec2): void;
    visitVec4(vec4: Vec4): void;
    visitColor(color: Color): void;
}

/**
 * Trait for objects that can be visited.
 */
interface Visitable {
    /**
     * Visits this object with the provided visitor.
     * @param visitor The visitor.
     */
    visit(visitor: Visitor): void;
}

export { Visitable, Visitor };