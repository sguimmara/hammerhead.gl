import Material from "@/materials/Material";

class PostProcessingMaterial extends Material {
    constructor(fragmentShader: string, vertexShader: string) {
        super({ fragmentShader, vertexShader, requiresObjectUniforms: false });
    }
}

export default PostProcessingMaterial;
