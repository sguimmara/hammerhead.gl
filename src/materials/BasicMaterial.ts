import chroma, { Color } from 'chroma-js';
import fragmentShader from './BasicMaterial.frag.wgsl';
import vertexShader from './default.vert.wgsl';
import Texture from '../textures/Texture';
import { ShaderLayout } from './ShaderLayout';
import Material from './Material';

const WHITE = chroma('white');

const layout = ShaderLayout.parse(fragmentShader, vertexShader);

class BasicMaterial extends Material {
    constructor() {
        super({ fragmentShader, vertexShader, layout });
        this.withDiffuseColor(WHITE);
    }

    withDiffuseColor(color: Color) {
        this.setColor(2, color);
        return this;
    }

    withColorTexture(texture: Texture) {
        this.setTexture(0, texture);
        return this;
    }
}

export default BasicMaterial;
