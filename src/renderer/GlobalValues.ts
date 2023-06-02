import { Vec2, vec2 } from "wgpu-matrix";
import Sized from "../core/Sized";
import { Visitable, Visitor } from "../core/Visitable";

class GlobalValues implements Sized, Visitable {
    time: number = 0;
    deltaTime: number = 0;
    screenSize: Vec2 = vec2.zero();

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