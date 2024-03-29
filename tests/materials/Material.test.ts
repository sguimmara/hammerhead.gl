import { Material } from '@materials';
import { describe, expect, it } from 'vitest';

describe('Version', () => {
    describe('incrementVersion', () => {
        it('should increment version', () => {
            const mat = new Material({ fragmentShader: '', vertexShader: '' });

            const version = mat.getVersion();

            mat.incrementVersion();

            expect(mat.getVersion()).toEqual(version + 1);
        });
    });
});

describe('constructor', () => {
    it('should assign a unique id', () => {
        const mat1 = new Material({ fragmentShader: '', vertexShader: '' });
        const mat2 = new Material({ fragmentShader: '', vertexShader: '' });
        const mat3 = new Material({ fragmentShader: '', vertexShader: '' });

        expect(mat1.id).not.toEqual(mat2.id);
        expect(mat1.id).not.toEqual(mat3.id);
    });

    it('should honor rendering parameters', () => {
        const cullingMode = 'front' as GPUCullMode;
        const renderOrder = 5;

        const mat = new Material({
            fragmentShader: '',
            vertexShader: '',
            cullingMode,
            renderOrder,
        });

        expect(mat.cullingMode).toEqual(cullingMode);
        expect(mat.renderOrder).toEqual(renderOrder);
    });

    it('should allocate default values for uniforms', () => {
        const fragmentShader = `
        @group(material) @binding(auto) var<uniform> foo : vec4f;
        @group(material) @binding(auto) var<uniform> bar : vec2f;
        `;

        const vertexShader = `
        @group(material) @binding(auto) var<uniform> baz : vec3f;
        @group(material) @binding(auto) var<uniform> bar : vec2f;
        `;

        const mat = new Material({ fragmentShader, vertexShader });

        expect(mat.getUntypedBufferUniform(mat.layout.getUniformBinding('foo')).value).toEqual(new Float32Array([0, 0, 0, 0]));
        expect(mat.getUntypedBufferUniform(mat.layout.getUniformBinding('bar')).value).toEqual(new Float32Array([0, 0]));
        expect(mat.getUntypedBufferUniform(mat.layout.getUniformBinding('baz')).value).toEqual(new Float32Array([0, 0, 0]));
    });
});
