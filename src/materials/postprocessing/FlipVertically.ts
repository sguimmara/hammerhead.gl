import Material from "../Material";

import shaderCode from '../../shaders/effects/flipY.wgsl';

class FlipVertically extends Material {
    constructor() {
        super({
            shaderCode
        });
    }
}

export default FlipVertically;