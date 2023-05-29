import Sized, { Sizes } from "../Sized";
import Vec2 from "../Vec2";
import { Visitable, Visitor } from "../Visitable";

class GlobalUniforms implements Sized, Visitable {
    time: number;
    padding0: number;
    screenSize: Vec2;

    constructor() {
        this.time = 0;
        this.screenSize = new Vec2();
    }

    getByteSize(): number {
        return 2 * Sizes.Float32 // time + padding
            + this.screenSize.getByteSize();
    }

    visit(visitor: Visitor): void {
        visitor.visitNumber(this.time);
        visitor.visitNumber(this.padding0);
        visitor.visitVec2(this.screenSize);
    }
}

export default GlobalUniforms;