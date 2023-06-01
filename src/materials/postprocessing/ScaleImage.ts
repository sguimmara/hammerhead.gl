import shaderCode from './ScaleImage.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";
import Vec2 from '../../core/Vec2';
import { ShaderLayout } from '../ShaderLayout';

const layout = ShaderLayout.parse(shaderCode);

class ScaleImage extends PostProcessingMaterial {
    private scale: Vec2 = new Vec2(1, 1);

    constructor({ scaleX = 1, scaleY = 1 } = {}) {
        super(shaderCode, layout);
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