import fragmentShader from "./MetallicRoughness.frag.wgsl";
import vertexShader from "./MetallicRoughness.vert.wgsl";
import { Texture } from "@/textures";
import Material from "./Material";
import { Color } from 'chroma-js';

/**
 * A physically based material that follows the metallic/roughness model.
 */
class MetallicRoughnessMaterial extends Material {
    private readonly albedoTextureBinding: number;
    private readonly emissiveTextureBinding: number;
    private readonly aoTextureBinding: number;
    private readonly normalTextureBinding: number;
    private readonly metalRoughnessTextureBinding: number;
    private readonly baseColorFactorBinding: number;
    private readonly metallicFactorBinding: number;
    private readonly roughnessFactorBinding: number;

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

        this.baseColorFactorBinding =
            this.layout.getUniformBinding("baseColorFactor");

        this.metallicFactorBinding =
            this.layout.getUniformBinding("metallicFactor");

        this.roughnessFactorBinding =
            this.layout.getUniformBinding("roughnessFactor");
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

    setBaseColorFactor(color: Color | number[]) {
        if (Array.isArray(color)) {
            this.setVec4(this.baseColorFactorBinding, color);
        } else {
            this.setColorUniform(this.baseColorFactorBinding, color)
        }
        return this;
    }

    setMetallicFactor(factor: number) {
        this.setScalar(this.metallicFactorBinding, factor);
        return this;
    }

    setRoughnessFactor(factor: number) {
        this.setScalar(this.roughnessFactorBinding, factor);
        return this;
    }
}

export default MetallicRoughnessMaterial;
