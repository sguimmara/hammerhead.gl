import shaderCode from './ScaleImage.wgsl';
import PostProcessingMaterial from "./PostProcessingMaterial";
import LayoutInfo from '../LayoutInfo';
import UniformType from '../UniformType';
import Vec2 from '../../Vec2';

const layout = [
    new LayoutInfo(0, UniformType.Texture),
    new LayoutInfo(1, UniformType.Sampler),
    new LayoutInfo(2, UniformType.Buffer),
];

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