import { CullingMode, FrontFace, Material, RenderingMode } from "@/materials";
import { describe, expect, it } from "vitest";

describe("constructor", () => {
    it("should assign a unique id", () => {
        const mat1 = new Material({ fragmentShader: "", vertexShader: "" });
        const mat2 = new Material({ fragmentShader: "", vertexShader: "" });
        const mat3 = new Material({ fragmentShader: "", vertexShader: "" });

        expect(mat1.id).not.toEqual(mat2.id);
        expect(mat1.id).not.toEqual(mat3.id);
    });

    it("should honor rendering parameters", () => {
        const renderingMode = RenderingMode.TriangleLines;
        const cullingMode = CullingMode.Front;
        const frontFace = FrontFace.CCW;
        const renderOrder = 5;

        const mat = new Material({
            fragmentShader: "",
            vertexShader: "",
            renderingMode,
            cullingMode,
            frontFace,
            renderOrder,
        });

        expect(mat.frontFace).toEqual(frontFace);
        expect(mat.cullingMode).toEqual(cullingMode);
        expect(mat.renderingMode).toEqual(renderingMode);
        expect(mat.renderOrder).toEqual(renderOrder);
    });

    it('should allocate default values for uniforms', () => {
        const fragmentShader = `
        UNIFORM(foo, vec4f)
        UNIFORM(bar, vec2f)
        `;

        const vertexShader = `
        UNIFORM(baz, vec3f)
        UNIFORM(bar, vec2f)
        `;

        const mat = new Material({ fragmentShader, vertexShader });

        expect(mat.getBufferUniform(mat.layout.getUniformBinding('foo')).value).toEqual(new Float32Array([0, 0, 0, 0]));
        expect(mat.getBufferUniform(mat.layout.getUniformBinding('bar')).value).toEqual(new Float32Array([0, 0]));
        expect(mat.getBufferUniform(mat.layout.getUniformBinding('baz')).value).toEqual(new Float32Array([0, 0, 0]));
    });
});
