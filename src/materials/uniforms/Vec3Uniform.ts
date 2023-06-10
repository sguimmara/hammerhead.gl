import { Vec3, vec3 } from "wgpu-matrix";
import BufferUniform from "./BufferUniform";
import { Visitor } from "@/core";

export default class Vec3Uniform extends BufferUniform {
    value: Vec3;

    constructor(v: Vec3 = vec3.create(0, 0, 0)) {
        super();
        this.value = v;
    }

    getByteSize(): number {
        return 8;
    }

    visit(visitor: Visitor): void {
        visitor.visitVec3(this.value);
    }
}
