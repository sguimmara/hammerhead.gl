import chroma, { Color } from "chroma-js";
import fragmentShader from "./SolidColor.frag.wgsl";
import wireframeVertexShader from "./wireframe.vert.wgsl";
import lineVertexShader from "./line-list.vert.wgsl";
import Material, { Primitive } from "./Material";

const WHITE = chroma("white");
/**
 * A simple material with no support for lighting.
 */
class LineMaterial extends Material {
    private readonly colorBinding: number;
    private readonly offsetBinding: number;

    constructor(
        params: {
            cullingMode?: GPUCullMode;
            primitive?: Primitive;
        } = {
            primitive: Primitive.WireTriangles,
        }
    ) {
        super({
            fragmentShader,
            vertexShader:
                params.primitive === Primitive.WireTriangles
                    ? wireframeVertexShader
                    : lineVertexShader,
            cullingMode: params.cullingMode,
            primitive: params.primitive,
        });

        this.colorBinding = this.layout.getUniformBinding("color");
        this.offsetBinding = this.layout.getUniformBinding("offset");

        this.withLineOffset(0.002);
    }

    withLineOffset(size: number) {
        this.setScalar(this.offsetBinding, size);
        return this;
    }

    setColor(color: Color) {
        this.setColorUniform(this.colorBinding, color);
        return this;
    }
}

export default LineMaterial;
