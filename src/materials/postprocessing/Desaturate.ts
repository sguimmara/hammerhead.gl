import shaderCode from './Desaturate.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";

class Desaturate extends PostProcessingMaterial {
    constructor() {
        super(shaderCode, 'Desaturate');
    }
}

export default Desaturate;