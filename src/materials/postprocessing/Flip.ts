import shaderCode from './Flip.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";
import Vec2 from '../../core/Vec2';
import { ShaderLayout } from '../ShaderLayout';

const layout = ShaderLayout.parse(shaderCode);

class Flip extends PostProcessingMaterial {
    private flip: Vec2 = new Vec2(1, 1);

    constructor({ flipX = false, flipY = false } = {}) {
        super(shaderCode, layout);
        this.flip.x = flipX ? 1 : 0;
        this.flip.y = flipY ? 1 : 0;
        this.setVec2(2, this.flip);
    }

    withFlipX(flip: boolean) {
        this.flip.x = flip ? 1 : 0;
        return this;
    }

    withFlipY(flip: boolean) {
        this.flip.y = flip ? 1 : 0;
        return this;
    }
}
export default Flip;