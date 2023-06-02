import { Mat4, mat4 } from "wgpu-matrix";
import BufferUniform from "./BufferUniform";
import { Visitor } from "../../core/Visitable";

export default class Mat4Uniform extends BufferUniform {
    value: Mat4 = mat4.identity();

    constructor(value: Mat4) {
        super();
        this.value = value;
    }

    getByteSize(): number {
        return 16 * 4;
    }
    visit(visitor: Visitor): void {
        visitor.visitMat4(this.value);
    }
}