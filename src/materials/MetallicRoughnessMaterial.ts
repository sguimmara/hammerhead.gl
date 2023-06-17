import fragmentShader from "./MetallicRoughness.frag.wgsl";
import triangleVertexShader from "./default.vert.wgsl";
import lineListVertexShader from "./line-list.vert.wgsl";
import pointsVertexShader from "./points.vert.wgsl";
import wireframeVertexShader from "./wireframe.vert.wgsl";
import { Texture } from "@/textures";
import Material, { RenderingMode, CullingMode, FrontFace } from "./Material";

function selectVertexShader(params: { renderingMode?: RenderingMode }): string {
    const { renderingMode } = params;
    if (renderingMode) {
        switch (renderingMode) {
            case RenderingMode.TriangleLines:
                return wireframeVertexShader;
            case RenderingMode.LineList:
                return lineListVertexShader;
            case RenderingMode.Points:
                return pointsVertexShader;
        }
    }

    return triangleVertexShader;
}

/**
 * A simple material with no support for lighting.
 */
class MetallicRoughnessMaterial extends Material {
    private readonly albedoTextureBinding: number;
    private readonly pointSizeBinding: number;
    private readonly offsetBinding: number;

    constructor(
        params: {
            renderingMode?: RenderingMode;
            cullingMode?: CullingMode;
            frontFace?: FrontFace;
        } = {}
    ) {
        super({
            fragmentShader,
            vertexShader: selectVertexShader(params),
            ...params,
        });

        this.albedoTextureBinding =
            this.layout.getUniformBinding("albedoTexture");

        switch (this.renderingMode) {
            case RenderingMode.TriangleLines:
            case RenderingMode.LineList:
                this.offsetBinding = this.layout.getUniformBinding('offset');
                this.withLineOffset(0.002);
                break;
            case RenderingMode.Points:
                this.pointSizeBinding = this.layout.getUniformBinding('pointSize');
                this.withPointSize(2);
                break;
        }
    }

    withLineOffset(size: number) {
        this.setScalar(this.offsetBinding, size);
        return this;
    }

    withPointSize(size: number) {
        this.setScalar(this.pointSizeBinding, size);
        return this;
    }

    setAlbedoTexture(texture: Texture) {
        this.setTexture(this.albedoTextureBinding, texture);
        return this;
    }
}

export default MetallicRoughnessMaterial;