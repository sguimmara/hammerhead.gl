import { Visitor } from '@/core';
import { ScalarUniform } from '@/materials/uniforms';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';

describe('constructor', () => {
    it('should assign properties', () => {
        const uniform = new ScalarUniform(102);
        expect(uniform.value).toEqual(102);

        uniform.value = 292;
        expect(uniform.value).toEqual(292);
    });
});

describe('getByteSize', () => {
    it('should return 4', () => {
        const uniform = new ScalarUniform();
        expect(uniform.getByteSize()).toEqual(4);
    });
});

describe('getVersion/incrementVersion', () => {
    it('should have a correct behaviour', () => {
        const uniform = new ScalarUniform();
        expect(uniform.getVersion()).toEqual(-1);

        uniform.incrementVersion();
        expect(uniform.getVersion()).toEqual(0);

        uniform.incrementVersion();
        expect(uniform.getVersion()).toEqual(1);
    });
});

describe('visit', () => {
    it('should visit the scalar value', () => {
        const uniform = new ScalarUniform(321);
        const visitor = mock<Visitor>();
        uniform.visit(visitor);

        expect(visitor.visitColor).not.toHaveBeenCalled();
        expect(visitor.visitMat4).not.toHaveBeenCalled();
        expect(visitor.visitVec2).not.toHaveBeenCalled();
        expect(visitor.visitVec3).not.toHaveBeenCalled();
        expect(visitor.visitVec4).not.toHaveBeenCalled();

        expect(visitor.visitNumber).toHaveBeenCalledOnce();
        expect(visitor.visitNumber).toHaveBeenCalledWith(321);
    });
});
