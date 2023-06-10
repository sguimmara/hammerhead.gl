import { Box3, MathUtils } from "@/core";
import { describe, expect, it } from "vitest";

describe('constructor', () => {
    it('should assign members', () => {
        const box = new Box3({
            min: [-1, -2, 3],
            max: [1, 2, 3],
        });

        expect(box.min).toEqual([-1, -2, 3]);
        expect(box.max).toEqual([1, 2, 3]);
    });

    it('should compute center and size', () => {
        const box = new Box3({
            min: [-1, -2, -3],
            max: [2, 3, 4],
        });

        expect(box.center).toEqual(new Float32Array([0.5, 0.5, 0.5]));
        expect(box.size).toEqual([3, 5, 7]);
    });
});

describe('clone', () => {
    it('should return a different, but equal, object', () => {
        const box = new Box3({
            min: [-1, -2, 3],
            max: [1, 2, 3],
        });

        const clone = box.clone();

        expect(clone).not.toBe(box);
        expect(clone.min).toEqual([-1, -2, 3]);
        expect(clone.max).toEqual([1, 2, 3]);
    });
});

describe('expand', () => {
    it('should return the same, mutated object', () => {
        const box = new Box3({
            min: [0, 0, 0],
            max: [0, 0, 0],
        });

        const other = new Box3({
            min: [-1, -2, -3],
            max: [1, 2, 3],
        });

        const expanded = box.expand(other);

        expect(expanded).toBe(box);
        expect(expanded.min).toEqual([-1, -2, -3]);
        expect(expanded.max).toEqual([1, 2, 3]);
    });
});

describe('fromPoints', () => {
    it('should return a tight bbox', () => {
        const points = [];

        const min = -91919;
        const max = 23231.223;
        const xs = [];
        const ys = [];
        const zs = [];
        for (let i = 0; i < 1000; i++) {
            const x = MathUtils.random(min, max);
            const y = MathUtils.random(min, max);
            const z = MathUtils.random(min, max);

            points.push(x);
            points.push(y);
            points.push(z);

            xs.push(x);
            ys.push(y);
            zs.push(z);
        }

        const box = Box3.fromPoints(points);

        expect(box.min).toEqual(new Float32Array([
            Math.min(...xs),
            Math.min(...ys),
            Math.min(...zs),
        ]));

        expect(box.max).toEqual(new Float32Array([
            Math.max(...xs),
            Math.max(...ys),
            Math.max(...zs),
        ]));
    });
});
