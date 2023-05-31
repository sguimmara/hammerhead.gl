import shaderCode from './SinWave.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";
import { getUniforms } from '../Material';

const layout = getUniforms(shaderCode);

class SinWave extends PostProcessingMaterial {
    constructor({ speed = 1 } = {}) {
        super(shaderCode, 'SinWave', layout);
        this.setScalar(2, speed);
    }

    set speed(v: number) {
        this.setScalar(2, v);
    }
}

export default SinWave;