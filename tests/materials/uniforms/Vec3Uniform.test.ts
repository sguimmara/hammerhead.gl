import { Visitor } from "@/core";
import { Vec3Uniform } from "@/materials/uniforms";
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";

describe('constructor', () => {
    it('should assign properties', () => {
        const uniform = new Vec3Uniform([1, 2, 3]);
        expect(uniform.value).toEqual([1, 2, 3]);

        uniform.value = [292, 111, 123];
        expect(uniform.value).toEqual([292, 111, 123]);
    });
});

describe('getByteSize', () => {
    it('should return 12', () => {
        const uniform = new Vec3Uniform();
        expect(uniform.getByteSize()).toEqual(12);
    });
});

describe('visit', () => {
    it('should visit the vec3 value', () => {
        const uniform = new Vec3Uniform([1, 2, 3]);
        const visitor = mock<Visitor>();
        uniform.visit(visitor);

        expect(visitor.visitColor).not.toHaveBeenCalled();
        expect(visitor.visitMat4).not.toHaveBeenCalled();
        expect(visitor.visitNumber).not.toHaveBeenCalled();
        expect(visitor.visitVec2).not.toHaveBeenCalled();
        expect(visitor.visitVec4).not.toHaveBeenCalled();

        expect(visitor.visitVec3).toHaveBeenCalledOnce();
        expect(visitor.visitVec3).toHaveBeenCalledWith([1, 2, 3]);
    });
});
