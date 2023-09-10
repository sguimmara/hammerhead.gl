import { Visitor } from '@/core';
import { Vec4Uniform } from '@/materials/uniforms';
import chroma from 'chroma-js';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';

describe('constructor', () => {
    it('should assign properties', () => {
        const uniform = new Vec4Uniform([1, 2, 3, 4]);
        expect(uniform.value).toEqual([1, 2, 3, 4]);

        uniform.value = [292, 111, 123, 909];
        expect(uniform.value).toEqual([292, 111, 123, 909]);
    });
});

describe('fromColor', () => {
    it('should convert the color to a vec4 properly', () => {
        const uniform = new Vec4Uniform();
        const color = chroma('pink');
        uniform.fromColor(color);
        const expected = new Float32Array(color.gl());
        expect(uniform.value).toEqual(expected);
    });
});

describe('getByteSize', () => {
    it('should return 16', () => {
        const uniform = new Vec4Uniform();
        expect(uniform.getByteSize()).toEqual(16);
    });
});

describe('visit', () => {
    it('should visit the vec4 value', () => {
        const uniform = new Vec4Uniform([1, 2, 3, 4]);
        const visitor = mock<Visitor>();
        uniform.visit(visitor);

        expect(visitor.visitColor).not.toHaveBeenCalled();
        expect(visitor.visitMat4).not.toHaveBeenCalled();
        expect(visitor.visitNumber).not.toHaveBeenCalled();
        expect(visitor.visitVec2).not.toHaveBeenCalled();
        expect(visitor.visitVec3).not.toHaveBeenCalled();

        expect(visitor.visitVec4).toHaveBeenCalledOnce();
        expect(visitor.visitVec4).toHaveBeenCalledWith([1, 2, 3, 4]);
    });
});
