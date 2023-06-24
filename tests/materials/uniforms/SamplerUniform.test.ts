import { SamplerUniform } from "@/materials/uniforms";
import { describe, expect, it } from "vitest";

describe('constructor', () => {
    it('should assign a sampler', () => {
        const uniform = new SamplerUniform();

        expect(uniform.value).not.toBeUndefined();
    });
});
