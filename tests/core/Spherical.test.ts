import { describe, expect, it } from 'vitest';
import Spherical from '@/core/Spherical';

describe('constructor', () => {
    it('should assign the properties', () => {
        const deflt = new Spherical();

        expect(deflt.phi).toEqual(0);
        expect(deflt.theta).toEqual(0);
        expect(deflt.radius).toEqual(1);

        const s = new Spherical(5, 2, 3);

        expect(s.radius).toEqual(5);
        expect(s.phi).toEqual(2);
        expect(s.theta).toEqual(3);
    });
});

describe('set', () => {
    it('should set the properties', () => {
        const s = new Spherical();

        s.set(9, 2, 4);

        expect(s.radius).toEqual(9);
        expect(s.phi).toEqual(2);
        expect(s.theta).toEqual(4);
    });
});

describe('copy', () => {
    it('should copy the properties', () => {
        const original = new Spherical(9, 2, 7);
        const copy = new Spherical(3, 6, 4);

        copy.copy(original);

        expect(original.radius).toEqual(9);
        expect(original.phi).toEqual(2);
        expect(original.theta).toEqual(7);

        expect(copy.radius).toEqual(9);
        expect(copy.phi).toEqual(2);
        expect(copy.theta).toEqual(7);
    });
});

describe('clone', () => {
    it('should return a new object', () => {
        const original = new Spherical(9, 2, 7);
        const clone = original.clone();

        expect(clone).not.toBe(original);

        expect(clone.radius).toEqual(9);
        expect(clone.phi).toEqual(2);
        expect(clone.theta).toEqual(7);
    });
});
