import { ShaderLayout } from '../ShaderLayout';
import shaderCode from './InvertColors.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";

const layout = ShaderLayout.parse(shaderCode);

class InvertColors extends PostProcessingMaterial {
    constructor() {
        super(shaderCode, layout);
    }
}

export default InvertColors;