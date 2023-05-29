import Material from "../Material";

import shaderCode from './Desaturate.wgsl';

class Desaturate extends Material {
    constructor() {
        super({
            shaderCode
        });
    }
}

export default Desaturate;