import { EventDispatcher } from "@/core";
import { describe, expect, it, vi } from "vitest";

describe("on", () => {
    it("should register the event handlers", () => {
        const emitter = {};
        const dispatcher = new EventDispatcher<Object>(emitter);

        const handler1 = vi.fn();
        dispatcher.on("foo", handler1);

        const handler2 = vi.fn();
        dispatcher.on("foo", handler2);

        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).not.toHaveBeenCalled();

        dispatcher.dispatch("foo");

        expect(handler1).toHaveBeenCalledWith({ emitter });
        expect(handler2).toHaveBeenCalledWith({ emitter });
    });

    it('should throw on missing params', () => {
        const dispatcher = new EventDispatcher<Object>({});
        expect(() => dispatcher.on(null, null)).toThrowError(/missing event name/);
        expect(() => dispatcher.on('foo', null)).toThrowError(/missing event handler/);
    });
});
