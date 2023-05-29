import Vec2 from "./Vec2";

interface Visitor {
    visitNumber(number: number): void;
    visitVec2(vec2: Vec2): void;
}

interface Visitable {
    visit(visitor: Visitor): void;
}

export { Visitable, Visitor };