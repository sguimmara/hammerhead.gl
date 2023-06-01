import shaderCode from './Colorimetry.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";
import { ShaderLayout } from '../ShaderLayout';

const layout = ShaderLayout.parse(shaderCode);

class Colorimetry extends PostProcessingMaterial {
    constructor({ saturation = 1, brightness = 1} = {}) {
        super(shaderCode, layout);

        this.setScalar(2, saturation);
        this.setScalar(3, brightness);
    }

    withSaturation(saturation: number) {
        this.setScalar(2, saturation);
        return this;
    }

    withBrightness(brightness: number) {
        this.setScalar(3, brightness);
        return this;
    }
}

export default Colorimetry;