import { getUniforms } from '../Material';
import shaderCode from './InvertColors.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";

const layout = getUniforms(shaderCode);

class InvertColors extends PostProcessingMaterial {
    constructor() {
        super(shaderCode, 'InvertColors', layout);
    }
}

export default InvertColors;