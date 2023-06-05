import { Vec2, vec2 } from 'wgpu-matrix';
import fragmentShader from './Flip.wgsl';
import vertexShader from '../screenQuad.vert.wgsl';
import PostProcessingMaterial from './PostProcessingMaterial';

class Flip extends PostProcessingMaterial {
    private flip: Vec2 = vec2.create(1, 1);

    constructor({ flipX = false, flipY = false } = {}) {
        super(fragmentShader, vertexShader);
        this.flip[0] = flipX ? 1 : 0;
        this.flip[1] = flipY ? 1 : 0;
        this.setVec2(2, this.flip);
    }

    withFlipX(flip: boolean) {
        this.flip[0] = flip ? 1 : 0;
        this.setVec2(2, this.flip);
        return this;
    }

    withFlipY(flip: boolean) {
        this.flip[1] = flip ? 1 : 0;
        this.setVec2(2, this.flip);
        return this;
    }
}
export default Flip;