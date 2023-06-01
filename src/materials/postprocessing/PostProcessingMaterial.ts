import Material from "../Material";
import { ShaderLayout } from "../ShaderLayout";

class PostProcessingMaterial extends Material {
    constructor(shaderCode: string, layout : ShaderLayout) {
        super({ shaderCode, layout });
    }
}

export default PostProcessingMaterial;
