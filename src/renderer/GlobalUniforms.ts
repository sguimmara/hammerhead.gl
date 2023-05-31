import Vec2 from "../Vec2";
import { Visitor } from "../Visitable";
import BufferUniform from "./BufferUniform";

class GlobalUniforms implements BufferUniform {
    value: unknown; // TODO
    time: number = 0;
    padding0: number = 0;
    screenSize: Vec2 = Vec2.zero;

    getByteSize(): number {
        return 2 * 4 // time + padding
            + this.screenSize.getByteSize();
    }

    visit(visitor: Visitor): void {
        visitor.visitNumber(this.time);
        visitor.visitNumber(this.padding0);
        visitor.visitVec2(this.screenSize);
    }
}

export default GlobalUniforms;