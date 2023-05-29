import Material from "../Material";

import shaderCode from './FlipVertically.wgsl';

class FlipVertically extends Material {
    constructor() {
        super({
            shaderCode
        });
    }
}

export default FlipVertically;