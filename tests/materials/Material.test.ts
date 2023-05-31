import { getUniforms } from '../../src/materials/Material';
import UniformType from '../../src/materials/UniformType';

describe('getUniforms', () => {
    it('should return the correct binding and name', () => {
        const shadercode = `
            @group(GLOBAL_UNIFORMS_BIND_GROUP) @binding(0) var colorTexture: texture_2d<f32>;
            @group(OBJECT_UNIFORMS_BIND_GROUP) @binding(2) var colorSampler: sampler;

            @group(OBJECT_UNIFORMS_BIND_GROUP) @binding(1) var<uniform> color: vec4f;
        `;

        const layout = getUniforms(shadercode);

        expect(layout.length).toEqual(3);

        const binding0 = layout[0];
        expect(binding0.group).toEqual(0);
        expect(binding0.binding).toEqual(0);
        expect(binding0.type).toEqual(UniformType.Texture2D);
        expect(binding0.name).toEqual('colorTexture');

        const binding1 = layout[1];
        expect(binding1.group).toEqual(1);
        expect(binding1.binding).toEqual(2);
        expect(binding1.type).toEqual(UniformType.Sampler);
        expect(binding1.name).toEqual('colorSampler');

        const binding2 = layout[2];
        expect(binding2.group).toEqual(1);
        expect(binding2.binding).toEqual(1);
        expect(binding2.type).toEqual(UniformType.Vec4);
        expect(binding2.name).toEqual('color');
    });
});