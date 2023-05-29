import Material from "../Material";

import shaderCode from '../../shaders/effects/invertColor.wgsl';

class InvertColors extends Material {
    constructor() {
        super({
            shaderCode
        });
    }
}

export default InvertColors;