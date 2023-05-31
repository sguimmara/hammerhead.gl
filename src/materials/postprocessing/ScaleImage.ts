import shaderCode from './ScaleImage.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";
import Vec2 from '../../Vec2';
import { getUniforms } from '../Material';

const layout = getUniforms(shaderCode);

class ScaleImage extends PostProcessingMaterial {
    private scale: Vec2 = new Vec2(1, 1);

    constructor({ scaleX = 1, scaleY = 1 } = {}) {
        super(shaderCode, 'ScaleImage', layout);
        this.scale.x = scaleX;
        this.scale.y = scaleY;
        this.setVec2(2, this.scale);
    }

    withXScale(scaleX: number) {
        this.scale.x = scaleX;
        return this;
    }

    withYScale(scaleY: number) {
        this.scale.y = scaleY;
        return this;
    }
}
export default ScaleImage;