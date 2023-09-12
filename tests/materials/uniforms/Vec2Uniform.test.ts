/* eslint-disable @typescript-eslint/unbound-method */
import { Visitor } from '@core';
import { Vec2Uniform } from '@materials/uniforms';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';

describe('constructor', () => {
    it('should assign properties', () => {
        const uniform = new Vec2Uniform([1, 2]);
        expect(uniform.value).toEqual([1, 2]);

        uniform.value = [292, 111];
        expect(uniform.value).toEqual([292, 111]);
    });
});

describe('getByteSize', () => {
    it('should return 8', () => {
        const uniform = new Vec2Uniform();
        expect(uniform.getByteSize()).toEqual(8);
    });
});

describe('visit', () => {
    it('should visit the vec2 value', () => {
        const uniform = new Vec2Uniform([1, 2]);
        const visitor = mock<Visitor>();
        uniform.visit(visitor);

        expect(visitor.visitColor).not.toHaveBeenCalled();
        expect(visitor.visitMat4).not.toHaveBeenCalled();
        expect(visitor.visitNumber).not.toHaveBeenCalled();
        expect(visitor.visitVec3).not.toHaveBeenCalled();
        expect(visitor.visitVec4).not.toHaveBeenCalled();

        expect(visitor.visitVec2).toHaveBeenCalledOnce();
        expect(visitor.visitVec2).toHaveBeenCalledWith([1, 2]);
    });
});
