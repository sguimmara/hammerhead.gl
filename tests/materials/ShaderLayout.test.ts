import { BindGroups } from '@/core';
import { ShaderLayout, AttributeType, UniformType, AttributeInfo, UniformInfo } from '@/materials';
import { describe, expect, it } from 'vitest';

describe('getAttributeLocation', () => {
    it('should throw if the attribute is not found', () => {
        const layout = new ShaderLayout([], []);

        expect(() => layout.getAttributeLocation('normal')).toThrow(/no such attribute: normal/);
    });

    it('should return the correct location', () => {
        const attrs = [
            new AttributeInfo(1, AttributeType.Vec3, 'position'),
            new AttributeInfo(4, AttributeType.Vec2, 'texcoord'),
            new AttributeInfo(0, AttributeType.Vec2, 'texcoord1'),
        ]
        const layout = new ShaderLayout(attrs, []);

        expect(layout.getAttributeLocation('position')).toEqual(1);
        expect(layout.getAttributeLocation('texcoord')).toEqual(4);
        expect(layout.getAttributeLocation('texcoord1')).toEqual(0);
    });
});

describe('getUniformBinding', () => {
    it('should throw if the uniform is not found', () => {
        const layout = new ShaderLayout([], []);

        expect(() => layout.getUniformBinding('foo')).toThrow(/no such uniform: foo/);
    });

    it('should return the correct location', () => {
        const uniforms = [
            new UniformInfo(BindGroups.MaterialUniforms, 1, UniformType.Vec2, 'foo', true, false),
            new UniformInfo(BindGroups.MaterialUniforms, 4, UniformType.Vec2, 'bar', true, false),
            new UniformInfo(BindGroups.MaterialUniforms, 0, UniformType.Vec2, 'baz', true, false),
        ]
        const layout = new ShaderLayout([], uniforms);

        expect(layout.getUniformBinding('foo')).toEqual(1);
        expect(layout.getUniformBinding('bar')).toEqual(4);
        expect(layout.getUniformBinding('baz')).toEqual(0);
    });
});
