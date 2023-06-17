import { Versioned } from "@/core";
import { describe, expect, it } from "vitest";

describe("Versioned", () => {
    describe("value", () => {
        it("should return the underlying value", () => {
            const vNumber = new Versioned(19);
            expect(vNumber.value).toEqual(19);

            const vString = new Versioned("hello");
            expect(vString.value).toEqual("hello");

            const obj = { foo: 3 };
            const vObject = new Versioned(obj);
            expect(vObject.value).toBe(obj);
        });
    });

    describe('incrementVersion/getVersion/setVersion', () => {
        it('should return the correct value', () => {
            const v = new Versioned(19);

            expect(v.getVersion()).toEqual(0);

            v.incrementVersion();
            expect(v.getVersion()).toEqual(1);

            v.incrementVersion();
            expect(v.getVersion()).toEqual(2);

            v.setVersion(99);
            expect(v.getVersion()).toEqual(99);
        });
    });
});
