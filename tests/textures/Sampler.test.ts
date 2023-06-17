import { AddressMode, FilterMode, Sampler } from "@/textures";
import { expect, it } from "vitest";

it('should assign default values', () => {
    const sampler = new Sampler();

    expect(sampler.magFilter).toEqual(FilterMode.Linear);
    expect(sampler.minFilter).toEqual(FilterMode.Linear);
    expect(sampler.addressModeU).toEqual(AddressMode.ClampToEdge);
    expect(sampler.addressModeV).toEqual(AddressMode.ClampToEdge);
});
