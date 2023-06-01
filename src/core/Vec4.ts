import { Color } from "chroma-js";

class Vec4 {
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

    static fromColor(color: Color) {
        const [r, g, b, a] = color.gl();
        return new Vec4(r, g, b, a);
    }
}

export default Vec4;