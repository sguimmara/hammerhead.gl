import Material from "./Material";

import shaderCode from '../shaders/basic.wgsl';

class ScreenQuadMaterial extends Material {
    constructor() {
        super({ shaderCode });
    }
}

export default ScreenQuadMaterial;
