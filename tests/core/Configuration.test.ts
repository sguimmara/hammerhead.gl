import Configuration from "@/core/Configuration";
import { describe, expect, it } from "vitest";

describe('default()', () => {
    it('should assign default values', () => {
        const config = Configuration.default;

        expect(config.depthBufferFormat).toEqual('depth32float');
    });
});
