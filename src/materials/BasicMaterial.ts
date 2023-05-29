import Material from "./Material";

import shaderCode from './BasicMaterial.wgsl';
import Texture from "../textures/Texture";

class BasicMaterial extends Material {
    constructor() {
        super({ shaderCode });
    }

    setColorTexture(texture: Texture) {
        this.bindTexture(0, texture);
    }
}

export default BasicMaterial;
