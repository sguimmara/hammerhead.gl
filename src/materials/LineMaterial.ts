import chroma, { Color } from "chroma-js";
import fragmentShader from "./BasicMaterial.frag.wgsl";
import lineListVertexShader from "./line-list.vert.wgsl";
import wireframeVertexShader from "./wireframe.vert.wgsl";
import { Texture } from "@/textures";
import Material from "./Material";
import ShaderError from "./ShaderError";

const WHITE = chroma("white");

function selectVertexShader(topology: GPUPrimitiveTopology): string {
    switch (topology) {
        case "point-list":
            throw new ShaderError('invalid topology');
        case "line-list":
        case "line-strip":
            return lineListVertexShader;
        default:
            return wireframeVertexShader;
    }
}

/**
 * A simple material with no support for lighting.
 */
class LineMaterial extends Material {
    private readonly colorBinding: number;
    private readonly colorTextureBinding: number;
    private readonly offsetBinding: number;

    constructor(
        params: {
            cullingMode?: GPUCullMode;
            topology?: GPUPrimitiveTopology;
        } = {}
    ) {
        super({
            fragmentShader,
            vertexShader: selectVertexShader(params.topology),
            cullingMode: params.cullingMode,
        });

        this.colorBinding = this.layout.getUniformBinding("color");
        this.colorTextureBinding =
            this.layout.getUniformBinding("colorTexture");

        this.offsetBinding = this.layout.getUniformBinding("offset");
        this.withLineOffset(0.002);

        this.withDiffuseColor(WHITE);
    }

    withLineOffset(size: number) {
        this.setScalar(this.offsetBinding, size);
        return this;
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

export default LineMaterial;
