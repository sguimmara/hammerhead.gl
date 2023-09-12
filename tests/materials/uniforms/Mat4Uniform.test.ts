/* eslint-disable @typescript-eslint/unbound-method */
import { Visitor } from '@core';
import { Mat4Uniform } from '@materials/uniforms';
import { describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { mat4 } from 'wgpu-matrix';

describe('constructor', () => {
    it('should assign properties', () => {
        const matrix = mat4.identity();
        const uniform = new Mat4Uniform(matrix);
        expect(uniform.value).toEqual(matrix);

        const newMatrix = mat4.rotateX(matrix, 12);
        uniform.value = newMatrix;
        expect(uniform.value).toEqual(newMatrix);
    });
});

describe('getByteSize', () => {
    it('should return 64', () => {
        const uniform = new Mat4Uniform();
        expect(uniform.getByteSize()).toEqual(64);
    });
});

describe('visit', () => {
    it('should visit the vec4 value', () => {
        const matrix = mat4.identity();
        const uniform = new Mat4Uniform(matrix);
        const visitor = mock<Visitor>();
        uniform.visit(visitor);

        expect(visitor.visitColor).not.toHaveBeenCalled();
        expect(visitor.visitNumber).not.toHaveBeenCalled();
        expect(visitor.visitVec2).not.toHaveBeenCalled();
        expect(visitor.visitVec3).not.toHaveBeenCalled();
        expect(visitor.visitVec4).not.toHaveBeenCalled();

        expect(visitor.visitMat4).toHaveBeenCalledOnce();
        expect(visitor.visitMat4).toHaveBeenCalledWith(matrix);
    });
});
