import { Visitor } from "../../core/Visitable";
import { Vec3 } from "../../index";
import BufferUniform from "./BufferUniform";

export default class Vec3Uniform extends BufferUniform {
    value: Vec3;

    constructor(vec3: Vec3 = new Vec3(0, 0)) {
        super();
        this.value = vec3;
    }

    getByteSize(): number {
        return 8;
    }

    visit(visitor: Visitor): void {
        visitor.visitVec3(this.value);
    }
}
