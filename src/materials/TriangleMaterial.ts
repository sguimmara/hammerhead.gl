import Material from "./Material";

import shaderCode from '../shaders/triangle.wgsl';

class TriangleMaterial extends Material {
    constructor() {
        super({ shaderCode });
    }
}

export default TriangleMaterial;
