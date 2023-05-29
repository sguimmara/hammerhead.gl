import Material from "./Material";

import shaderCode from '../shaders/basic.wgsl';
import Texture from "../textures/Texture";

class ScreenQuadMaterial extends Material {
    constructor(texture : Texture) {
        super({ shaderCode, texture });
    }
}

export default ScreenQuadMaterial;
