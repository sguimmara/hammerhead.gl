import { RawSource } from "@/textures";
import { describe, expect, it } from "vitest";

describe('getData', () => {
    it('should return the input data', () => {
        const buffer = new Float32Array();
        const source = new RawSource(buffer, 111, 222);

        expect(source.getImage()).toBe(buffer);
    });
});

describe('width/height', () => {
    it('should return input values', () => {
        const source = new RawSource(null, 111, 222);

        expect(source.width).toEqual(111);
        expect(source.height).toEqual(222);
    });
});
