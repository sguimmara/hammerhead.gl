import chroma, { Color } from 'chroma-js';
import fragmentShader from './BasicMaterial.frag.wgsl';
import triangleVertexShader from './default.vert.wgsl';
import { Texture } from '@/textures';
import Material from './Material';

const WHITE = chroma('white');

/**
 * A simple material with no support for lighting.
 */
class BasicMaterial extends Material {
    private readonly colorBinding: number;
    private readonly colorTextureBinding: number;

    constructor(
        params: {
            cullingMode?: GPUCullMode;
            frontFace?: GPUFrontFace;
        } = {}
    ) {
        super({
            fragmentShader,
            vertexShader: triangleVertexShader,
            ...params,
        });

        this.colorBinding = this.layout.getUniformBinding('color');
        this.colorTextureBinding =
            this.layout.getUniformBinding('colorTexture');

        this.setDiffuseColor(WHITE);
    }

    setDiffuseColor(color: Color) {
        this.setColorUniform(this.colorBinding, color);
        return this;
    }

    withColorTexture(texture: Texture) {
        this.setTexture(this.colorTextureBinding, texture);
        return this;
    }
}

export default BasicMaterial;
