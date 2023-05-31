import { Color } from "chroma-js";
import Sized from "./Sized";
import { Visitable, Visitor } from "./Visitable";

class Vec4 implements Sized, Visitable {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static get zero(): Vec4 {
        return new Vec4();
    }

    visit(visitor: Visitor): void {
        visitor.visitVec4(this);
    }

    getByteSize(): number {
        return 2 * 4;
    }

    static fromColor(color: Color) {
        const [r, g, b, a] = color.gl();
        return new Vec4(r, g, b, a);
    }
}

export default Vec4;