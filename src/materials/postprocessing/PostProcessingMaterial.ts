import Material from "../Material";
import { ShaderLayout } from "../ShaderLayout";

class PostProcessingMaterial extends Material {
    constructor(fragmentShader: string, vertexShader: string, layout : ShaderLayout) {
        super({ fragmentShader, vertexShader, layout, requiresObjectUniforms: false });
    }
}

export default PostProcessingMaterial;
