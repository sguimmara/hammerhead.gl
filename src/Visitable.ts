import Vec2 from "./Vec2";

/**
 * Visitor.
 */
interface Visitor {
    visitNumber(number: number): void;
    visitVec2(vec2: Vec2): void;
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