import shaderCode from './InvertColors.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";

class InvertColors extends PostProcessingMaterial {
    constructor() {
        super(shaderCode, 'InvertColors');
    }
}

export default InvertColors;