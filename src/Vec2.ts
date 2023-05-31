import Sized from "./Sized";
import { Visitable, Visitor } from "./Visitable";

class Vec2 implements Sized, Visitable {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    static get zero(): Vec2 {
        return new Vec2();
    }

    visit(visitor: Visitor): void {
        visitor.visitVec2(this);
    }

    getByteSize(): number {
        return 2 * 4;
    }
}

export default Vec2;