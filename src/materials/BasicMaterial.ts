import chroma, { Color } from "chroma-js";
import fragmentShader from "./BasicMaterial.frag.wgsl";
import triangleVertexShader from "./default.vert.wgsl";
import lineListVertexShader from "./line-list.vert.wgsl";
import pointsVertexShader from "./points.vert.wgsl";
import wireframeVertexShader from "./wireframe.vert.wgsl";
import { Texture } from "@/textures";
import Material, { RenderingMode, CullingMode, FrontFace } from "./Material";

const WHITE = chroma("white");

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

class BasicMaterial extends Material {
    private readonly colorBinding: number;
    private readonly colorTextureBinding: number;

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

        this.colorBinding = this.layout.getUniformBinding("color");
        this.colorTextureBinding =
            this.layout.getUniformBinding("colorTexture");

        this.withDiffuseColor(WHITE);
    }

    withDiffuseColor(color: Color) {
        this.setColor(this.colorBinding, color);
        return this;
    }

    withColorTexture(texture: Texture) {
        this.setTexture(this.colorTextureBinding, texture);
        return this;
    }
}

export default BasicMaterial;
