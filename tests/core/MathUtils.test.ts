import { describe, expect, it } from "vitest";
import { MathUtils } from "@/core";

describe('deg2Rad', () => {
    it('should return the correct value', () => {
        expect(MathUtils.deg2rad(0)).toEqual(0);
        expect(MathUtils.deg2rad(180)).toEqual(Math.PI);
        expect(MathUtils.deg2rad(360)).toEqual(Math.PI * 2);
    });
});

describe('random', () => {
    it('should honor specified bounds', () => {
        const min = -110.22;
        const max = 12039.1111;

        for (let i = 0; i < 10000; i++) {
            const r = MathUtils.random(min, max);
            expect(r).toBeGreaterThanOrEqual(min);
            expect(r).toBeLessThanOrEqual(max);
        }
    });
});
