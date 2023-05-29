import shaderCode from './FlipVertically.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";

class FlipVertically extends PostProcessingMaterial {
    constructor() {
        super(shaderCode, 'FlipVertically');
    }
}
export default FlipVertically;