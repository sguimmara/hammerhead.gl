import Material from '@materials/Material';

/**
 * A {@link Material} used for post-processing effects.
 */
class PostProcessingMaterial extends Material {
    constructor(fragmentShader: string, vertexShader: string) {
        super({ fragmentShader, vertexShader, requiresObjectUniforms: false });
    }
}

export default PostProcessingMaterial;
