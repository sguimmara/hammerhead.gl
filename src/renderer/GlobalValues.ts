import Sized from "../Sized";
import Vec2 from "../Vec2";
import { Visitable, Visitor } from "../Visitable";

class GlobalValues implements Sized, Visitable {
    time: number = 0;
    deltaTime: number = 0;
    screenSize: Vec2 = Vec2.zero;

    getByteSize(): number {
        return 2 * 4 // time + deltaTime
            + this.screenSize.getByteSize();
    }

    visit(visitor: Visitor): void {
        visitor.visitNumber(this.time);
        visitor.visitNumber(this.deltaTime);
        visitor.visitVec2(this.screenSize);
    }
}

export default GlobalValues;