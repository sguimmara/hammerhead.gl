import { Sized, Version, Visitable, Visitor } from "@/core";
import { ObjectUniform, Vec3Uniform } from "@/materials/uniforms";
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";

describe("constructor", () => {
    it("should assign properties", () => {
        const obj = mock<Sized & Visitable & Version>();
        const uniform = new ObjectUniform(obj);
        expect(uniform.value).toBe(obj);

        const newObj = mock<Sized & Visitable & Version>();
        uniform.value = newObj;
        expect(uniform.value).toBe(newObj);
    });
});

describe("visit", () => {
    it("should delegate the visit to the object", () => {
        const obj = mock<Sized & Visitable & Version>();
        const uniform = new ObjectUniform(obj);
        const visitor = mock<Visitor>();
        uniform.visit(visitor);

        expect(obj.visit).toHaveBeenCalledOnce();

        expect(visitor.visitColor).not.toHaveBeenCalled();
        expect(visitor.visitMat4).not.toHaveBeenCalled();
        expect(visitor.visitNumber).not.toHaveBeenCalled();
        expect(visitor.visitVec2).not.toHaveBeenCalled();
        expect(visitor.visitVec4).not.toHaveBeenCalled();
        expect(visitor.visitVec3).not.toHaveBeenCalled();
    });
});

describe('getByteSize', () => {
    it('should delegate the call to the object', () => {
        const obj = mock<Sized & Visitable & Version>();
        const uniform = new ObjectUniform(obj);
        obj.getByteSize.mockReturnValue(14);

        expect(uniform.getByteSize()).toEqual(14);
    });
});

describe('getVersion', () => {
    it('should delegate the call to the object', () => {
        const obj = mock<Sized & Visitable & Version>();
        const uniform = new ObjectUniform(obj);
        obj.getVersion.mockReturnValue(14);

        expect(uniform.getVersion()).toEqual(14);
    });
});
