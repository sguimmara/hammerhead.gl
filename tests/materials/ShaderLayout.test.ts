import { BindGroups } from '@/core';
import { ShaderLayout, AttributeType, UniformType, AttributeInfo, UniformInfo } from '@/materials';
import { describe, expect, it } from 'vitest';

describe('getAttributeLocation', () => {
    it('should throw if the attribute is not found', () => {
        const layout = new ShaderLayout([], []);

        expect(() => layout.getAttributeLocation('foo')).toThrow(/no such attribute: foo/);
    });

    it('should return the correct location', () => {
        const attrs = [
            new AttributeInfo(1, AttributeType.Vec2, 'foo'),
            new AttributeInfo(4, AttributeType.Vec2, 'bar'),
            new AttributeInfo(0, AttributeType.Vec2, 'baz'),
        ]
        const layout = new ShaderLayout(attrs, []);

        expect(layout.getAttributeLocation('foo')).toEqual(1);
        expect(layout.getAttributeLocation('bar')).toEqual(4);
        expect(layout.getAttributeLocation('baz')).toEqual(0);
    });
});

describe('getUniformBinding', () => {
    it('should throw if the uniform is not found', () => {
        const layout = new ShaderLayout([], []);

        expect(() => layout.getUniformBinding('foo')).toThrow(/no such uniform: foo/);
    });

    it('should return the correct location', () => {
        const uniforms = [
            new UniformInfo(BindGroups.MaterialUniforms, 1, UniformType.Vec2, 'foo'),
            new UniformInfo(BindGroups.MaterialUniforms, 4, UniformType.Vec2, 'bar'),
            new UniformInfo(BindGroups.MaterialUniforms, 0, UniformType.Vec2, 'baz'),
        ]
        const layout = new ShaderLayout([], uniforms);

        expect(layout.getUniformBinding('foo')).toEqual(1);
        expect(layout.getUniformBinding('bar')).toEqual(4);
        expect(layout.getUniformBinding('baz')).toEqual(0);
    });
});
