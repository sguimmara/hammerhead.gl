import Material from "./Material";
import chroma, { Color } from "chroma-js";

import shaderCode from './BasicMaterial.wgsl';
import Texture from "../textures/Texture";
import UniformType from "./UniformType";
import LayoutInfo from "./LayoutInfo";

const WHITE = chroma('white');

const layout = [
    new LayoutInfo(0, UniformType.Texture),
    new LayoutInfo(1, UniformType.Sampler),
    new LayoutInfo(2, UniformType.Buffer),
];

class BasicMaterial extends Material {
    constructor() {
        super({ shaderCode, layout, typeId: 'BasicMaterial' });
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
