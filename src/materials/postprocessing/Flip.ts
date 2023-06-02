import { Vec2, vec2 } from 'wgpu-matrix';
import shaderCode from './Flip.wgsl';
import { ShaderLayout } from '../ShaderLayout';
import PostProcessingMaterial from './PostProcessingMaterial';

const layout = ShaderLayout.parse(shaderCode);

class Flip extends PostProcessingMaterial {
    private flip: Vec2 = vec2.create(1, 1);

    constructor({ flipX = false, flipY = false } = {}) {
        super(shaderCode, layout);
        this.flip[0] = flipX ? 1 : 0;
        this.flip[1] = flipY ? 1 : 0;
        this.setVec2(2, this.flip);
    }

    withFlipX(flip: boolean) {
        this.flip[0] = flip ? 1 : 0;
        return this;
    }

    withFlipY(flip: boolean) {
        this.flip[1] = flip ? 1 : 0;
        return this;
    }
}
export default Flip;