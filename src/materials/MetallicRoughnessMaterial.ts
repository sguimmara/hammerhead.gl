import fragmentShader from "./MetallicRoughness.frag.wgsl";
import vertexShader from "./MetallicRoughness.vert.wgsl";
import { Texture } from "@/textures";
import Material from "./Material";

/**
 * A physically based material that follows the metallic/roughness model.
 */
class MetallicRoughnessMaterial extends Material {
    private readonly albedoTextureBinding: number;
    private readonly emissiveTextureBinding: number;
    private readonly aoTextureBinding: number;
    private readonly normalTextureBinding: number;
    private readonly metalRoughnessTextureBinding: number;

    constructor(
        params: {
            cullingMode?: GPUCullMode;
            frontFace?: GPUFrontFace;
        } = {}
    ) {
        super({
            fragmentShader,
            vertexShader,
            ...params,
        });

        this.albedoTextureBinding =
            this.layout.getUniformBinding("albedoTexture");

        this.aoTextureBinding =
            this.layout.getUniformBinding("aoTexture");

        this.normalTextureBinding =
            this.layout.getUniformBinding("normalTexture");

        this.metalRoughnessTextureBinding =
            this.layout.getUniformBinding("metalRoughnessTexture");

        this.emissiveTextureBinding =
            this.layout.getUniformBinding("emissiveTexture");
    }

    setAlbedoTexture(texture: Texture) {
        this.setTexture(this.albedoTextureBinding, texture);
        return this;
    }

    setAmbientOcclusionTexture(texture: Texture) {
        this.setTexture(this.aoTextureBinding, texture);
        return this;
    }

    setMetalRoughnessTexture(texture: Texture) {
        this.setTexture(this.metalRoughnessTextureBinding, texture);
        return this;
    }

    setNormalTexture(texture: Texture) {
        this.setTexture(this.normalTextureBinding, texture);
        return this;
    }

    setEmissiveTexture(texture: Texture) {
        this.setTexture(this.emissiveTextureBinding, texture);
        return this;
    }
}

export default MetallicRoughnessMaterial;
