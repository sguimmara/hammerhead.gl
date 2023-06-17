import { Vec2, vec2 } from 'wgpu-matrix';
import fragmentShader from './Flip.wgsl';
import vertexShader from '../screenQuad.vert.wgsl';
import PostProcessingMaterial from './PostProcessingMaterial';

/**
 * Flips the image in the X and Y axes.
 */
class Flip extends PostProcessingMaterial {
    private flip: Vec2 = vec2.create(1, 1);
    private readonly flipBinding: number;

    constructor({ flipX = false, flipY = false } = {}) {
        super(fragmentShader, vertexShader);
        this.flip[0] = flipX ? 1 : 0;
        this.flip[1] = flipY ? 1 : 0;

        this.flipBinding = this.layout.getUniformBinding('flip');

        this.setVec2(this.flipBinding, this.flip);
    }

    withFlipX(flip: boolean) {
        this.flip[0] = flip ? 1 : 0;
        this.setVec2(this.flipBinding, this.flip);
        return this;
    }

    withFlipY(flip: boolean) {
        this.flip[1] = flip ? 1 : 0;
        this.setVec2(this.flipBinding, this.flip);
        return this;
    }
}
export default Flip;
