import Sized from "../core/Sized";
import { Visitable, Visitor } from "../core/Visitable";
import { Vec2 } from "../index";

class GlobalValues implements Sized, Visitable {
    time: number = 0;
    deltaTime: number = 0;
    screenSize: Vec2 = new Vec2(0, 0);

    getByteSize(): number {
        const f32 = 4;

        return f32 // time
            + f32  // deltaTime
            + 2 * f32 // screenSize;
    }

    visit(visitor: Visitor): void {
        visitor.visitNumber(this.time);
        visitor.visitNumber(this.deltaTime);
        visitor.visitVec2(this.screenSize);
    }
}

export default GlobalValues;