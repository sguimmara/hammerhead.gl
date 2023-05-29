import Material from "../Material";

import shaderCode from '../../shaders/effects/desaturate.wgsl';

class Desaturate extends Material {
    constructor() {
        super({
            shaderCode
        });
    }
}

export default Desaturate;