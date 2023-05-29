import { Color } from "chroma-js";
import Sized from "../Sized";
import { Visitable, Visitor } from "../Visitable";
import Texture from "../textures/Texture";

interface Uniform {}

abstract class BufferUniform implements Sized, Visitable, Uniform {
    abstract getByteSize(): number;
    abstract visit(visitor: Visitor): void;
}

class ColorUniform extends BufferUniform {
    color: Color;

    constructor(color: Color) {
        super();
        this.color = color;
    }

    getByteSize(): number {
        return 4 * 4;
    }

    visit(visitor: Visitor): void {
        const [r, g,  b, a] = this.color.gl();
        visitor.visitNumber(r);
        visitor.visitNumber(g);
        visitor.visitNumber(b);
        visitor.visitNumber(a);
    }
}

class TextureUniform implements Uniform {
    readonly texture: Texture;

    constructor(texture: Texture) {
        this.texture = texture;
    }
}

export {
    Uniform,
    BufferUniform,
    ColorUniform,
    TextureUniform,
}
