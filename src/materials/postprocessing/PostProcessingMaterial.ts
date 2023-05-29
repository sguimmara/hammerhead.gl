import LayoutInfo from "../LayoutInfo";
import Material from "../Material";
import UniformType from "../UniformType";

const layout = [
    new LayoutInfo(0, UniformType.Texture),
    new LayoutInfo(1, UniformType.Sampler),
]

class PostProcessingMaterial extends Material {
    constructor(shaderCode: string, typeId: string) {
        super({ shaderCode, layout, typeId });
    }
}

export default PostProcessingMaterial;
