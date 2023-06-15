import fragmentShader from "./Colorimetry.wgsl";
import vertexShader from "../screenQuad.vert.wgsl";
import PostProcessingMaterial from "./PostProcessingMaterial";

/**
 * Alters the colorimetry of the image.
 */
class Colorimetry extends PostProcessingMaterial {
    private readonly saturationBinding: number;
    private readonly brightnessBinding: number;

    constructor({ saturation = 1, brightness = 1} = {}) {
        super(fragmentShader, vertexShader);

        this.saturationBinding = this.layout.getUniformBinding('saturation');
        this.brightnessBinding = this.layout.getUniformBinding('brightness');

        this.withSaturation(saturation);
        this.withBrightness(brightness);
    }

    withSaturation(saturation: number) {
        this.setScalar(this.saturationBinding, saturation);
        return this;
    }

    withBrightness(brightness: number) {
        this.setScalar(this.brightnessBinding, brightness);
        return this;
    }
}

export default Colorimetry;
