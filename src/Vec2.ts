import Sized, { Sizes } from "./Sized";
import { Visitable, Visitor } from "./Visitable";

class Vec2 implements Sized, Visitable {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    visit(visitor: Visitor): void {
        visitor.visitVec2(this);
    }

    getByteSize(): number {
        return 2 * Sizes.Float32;
    }
}

export default Vec2;