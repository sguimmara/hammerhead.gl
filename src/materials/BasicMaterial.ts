import Material from "./Material";
import chroma, { Color } from "chroma-js";

import shaderCode from './BasicMaterial.wgsl';
import Texture from "../textures/Texture";
import { ShaderLayout } from "./ShaderLayout";

const WHITE = chroma('white');

const layout = ShaderLayout.parse(shaderCode);

class BasicMaterial extends Material {
    constructor() {
        super({ shaderCode, layout });
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
