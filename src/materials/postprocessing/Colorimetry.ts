import fragmentShader from "./Colorimetry.wgsl";
import vertexShader from "../screenQuad.vert.wgsl";
import PostProcessingMaterial from "./PostProcessingMaterial";

/**
 * Alters the colorimetry of the image.
 */
class Colorimetry extends PostProcessingMaterial {
    constructor({ saturation = 1, brightness = 1} = {}) {
        super(fragmentShader, vertexShader);

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
