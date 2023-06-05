import chroma, { Color } from 'chroma-js';
import fragmentShader from './BasicMaterial.frag.wgsl';
import triangleVertexShader from './default.vert.wgsl';
import pointsVertexShader from './points.vert.wgsl';
import linesVertexShader from './lines.vert.wgsl';
import Texture from '../textures/Texture';
import Material, { RenderingMode } from './Material';

const WHITE = chroma('white');

function selectVertexShader(params: {
    mode?: RenderingMode
}): string {
    const { mode } = params;
    if (mode) {
        switch (mode) {
            case RenderingMode.Lines:
                return linesVertexShader;
            case RenderingMode.Points:
                return pointsVertexShader;
        }
    }

    return triangleVertexShader;
}

class BasicMaterial extends Material {
    constructor(params: {
        mode?: RenderingMode
    } = {}) {
        super({
            fragmentShader,
            vertexShader: selectVertexShader(params),
            renderingMode: params.mode });
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
