import shaderCode from './Colorimetry.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";
import Vec2 from '../../Vec2';
import { getUniforms } from '../Material';

const layout = getUniforms(shaderCode);

class Colorimetry extends PostProcessingMaterial {
    private saturationBrightness: Vec2 = new Vec2(1, 1);

    constructor({ saturation = 1, brightness = 1} = {}) {
        super(shaderCode, 'Colorimetry', layout);

        this.saturationBrightness.x = saturation;
        this.saturationBrightness.y = brightness;
        this.setVec2(2, this.saturationBrightness);
    }

    withSaturation(saturation: number) {
        this.saturationBrightness.x = saturation;
        return this;
    }

    withBrightness(brightness: number) {
        this.saturationBrightness.y = brightness;
        return this;
    }
}

export default Colorimetry;