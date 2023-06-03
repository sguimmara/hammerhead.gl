import { Mat4, mat4 } from "wgpu-matrix";
import BufferUniform from "./BufferUniform";
import { Visitor } from "../../core/Visitable";

export default class Mat4Uniform extends BufferUniform {
    value: Mat4;

    constructor(value?: Mat4) {
        super();
        if (value) {
            this.value = value;
        } else {
            this.value = mat4.identity();
        }
    }

    getByteSize(): number {
        return 16 * 4;
    }

    visit(visitor: Visitor): void {
        visitor.visitMat4(this.value);
    }
}