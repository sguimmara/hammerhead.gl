import { describe, expect, it } from 'vitest'
import { AttributeType, ShaderLayout, UniformType } from '@/materials';

describe('parse', () => {
    it('should return the correct attributes', () => {
        const shaderCode = `
            struct VSOutput {
                @builtin(position) position: vec4f,
                @location(0) texcoord: vec2f,
            };

            struct Vertex {
                @location(0) position: vec3f,
                @location(1) texcoord: vec2f,
                @location(2) foo: vec2f,
                @location(3) bar: vec4f,
            };
        `

        const layout = ShaderLayout.parse('', shaderCode);
        const attributes = layout.attributes;

        expect(attributes.length).toEqual(4);

        expect(attributes[0].location).toEqual(0);
        expect(attributes[0].type).toEqual(AttributeType.Vec3);

        expect(attributes[1].location).toEqual(1);
        expect(attributes[1].type).toEqual(AttributeType.Vec2);

        expect(attributes[2].location).toEqual(2);
        expect(attributes[2].type).toEqual(AttributeType.Vec2);

        expect(attributes[3].location).toEqual(3);
        expect(attributes[3].type).toEqual(AttributeType.Vec4);
    });

    it('should return the correct uniforms', () => {
        const vertexShader = `
            struct VSOutput {
                @builtin(position) position: vec4f,
                @location(0) texcoord: vec2f,
            };

            struct Vertex {
                @location(0) position: vec3f,
                @location(1) texcoord: vec2f,
                @location(2) foo: vec2f,
                @location(3) bar: vec4f,
            };
        `

        const fragmentShader = `
            @group(GLOBAL_UNIFORMS) @binding(0) var colorTexture: texture_2d<f32>;
            @group(OBJECT_UNIFORMS) @binding(2) var colorSampler: sampler;

            @group(MATERIAL_UNIFORMS) @binding(1) var<uniform> color: vec4f;
        `;

        const layout = ShaderLayout.parse(fragmentShader, vertexShader);
        const uniforms = layout.uniforms;

        expect(uniforms.length).toEqual(2);

        const binding1 = uniforms[0];
        expect(binding1.group).toEqual(2);
        expect(binding1.binding).toEqual(2);
        expect(binding1.type).toEqual(UniformType.Sampler);
        expect(binding1.name).toEqual('colorSampler');

        const binding2 = uniforms[1];
        expect(binding2.group).toEqual(1);
        expect(binding2.binding).toEqual(1);
        expect(binding2.type).toEqual(UniformType.Vec4);
        expect(binding2.name).toEqual('color');
    });
});
