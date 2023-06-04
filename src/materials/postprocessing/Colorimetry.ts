import fragmentShader from "./Colorimetry.wgsl";
import vertexShader from "../screenQuad.vert.wgsl";
import PostProcessingMaterial from "./PostProcessingMaterial";
import { ShaderLayout } from "../ShaderLayout";

const layout = ShaderLayout.parse(fragmentShader, vertexShader);

class Colorimetry extends PostProcessingMaterial {
    constructor({ saturation = 1, brightness = 1} = {}) {
        super(fragmentShader, vertexShader, layout);

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