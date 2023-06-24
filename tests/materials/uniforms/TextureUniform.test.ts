import { TextureUniform } from "@/materials/uniforms";
import { Texture } from "@/textures";
import { describe, expect, it } from "vitest";

describe('constructor', () => {
    it('should assign the value', () => {
        const texture = new Texture();
        const uniform = new TextureUniform(texture);

        expect(uniform.value).toBe(texture);
    });
});

describe('getVersion/incrementVersion', () => {
    it('should behave correctly', () => {
        const uniform = new TextureUniform();

        expect(uniform.getVersion()).toEqual(-1);

        uniform.incrementVersion();
        expect(uniform.getVersion()).toEqual(0);

        uniform.incrementVersion();
        expect(uniform.getVersion()).toEqual(1);
    });
});
