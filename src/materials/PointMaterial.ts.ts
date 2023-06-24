import chroma, { Color } from "chroma-js";
import fragmentShader from "./SolidColor.frag.wgsl";
import vertexShader from "./points.vert.wgsl";
import Material, { Primitive } from "./Material";

const WHITE = chroma("white");
/**
 * Renders points as quads.
 */
class PointMaterial extends Material {
    private readonly colorBinding: number;
    private readonly pointSizeBinding: number;

    constructor(
        params: {
            cullingMode?: GPUCullMode;
        } = {
            cullingMode: 'none',
        }
    ) {
        super({
            fragmentShader,
            vertexShader,
            cullingMode: params.cullingMode,
            primitive: Primitive.Quads,
        });

        this.colorBinding = this.layout.getUniformBinding("color");
        this.pointSizeBinding = this.layout.getUniformBinding("pointSize");

        this.setPointSize(10);
        this.setColor(WHITE);
    }

    setPointSize(size: number) {
        this.setScalar(this.pointSizeBinding, size);
        return this;
    }

    setColor(color: Color) {
        this.setColorUniform(this.colorBinding, color);
        return this;
    }
}

export default PointMaterial;
