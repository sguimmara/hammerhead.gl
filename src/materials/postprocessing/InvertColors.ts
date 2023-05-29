import Material from "../Material";

import shaderCode from './InvertColors.wgsl';

class InvertColors extends Material {
    constructor() {
        super({
            shaderCode
        });
    }
}

export default InvertColors;