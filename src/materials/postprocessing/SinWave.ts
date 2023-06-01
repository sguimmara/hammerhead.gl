import shaderCode from './SinWave.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";
import { ShaderLayout } from '../ShaderLayout';

const layout = ShaderLayout.parse(shaderCode);

class SinWave extends PostProcessingMaterial {
    constructor({ speed = 1 } = {}) {
        super(shaderCode, layout);
        this.setScalar(2, speed);
    }

    set speed(v: number) {
        this.setScalar(2, v);
    }
}

export default SinWave;