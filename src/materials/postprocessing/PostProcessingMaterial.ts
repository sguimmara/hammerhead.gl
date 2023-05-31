import UniformInfo from "../UniformInfo";
import Material from "../Material";

class PostProcessingMaterial extends Material {
    constructor(shaderCode: string, typeId: string, layout : UniformInfo[]) {
        super({ shaderCode, layout, typeId });
    }
}

export default PostProcessingMaterial;
