import { EventDispatcher, ObservableEvent } from "@/core";
import { describe, expect, it, vi } from "vitest";

interface Events {
    'foo': boolean;
    'bar': number;
    'baz': string;
}

class MyClass {}

describe("on", () => {
    it("should register the event handlers", () => {
        const source = {};
        const dispatcher = new EventDispatcher<MyClass, Events>(source);

        const stringHandler = vi.fn<[ObservableEvent<MyClass, string>], void>();
        dispatcher.on('baz', stringHandler);

        const boolHandler = vi.fn<[ObservableEvent<MyClass, boolean>], void>();
        dispatcher.on("foo", boolHandler);

        const barHandler = vi.fn<[ObservableEvent<MyClass, number>], void>();
        dispatcher.on("bar", barHandler);

        expect(stringHandler).not.toHaveBeenCalled();
        expect(boolHandler).not.toHaveBeenCalled();

        dispatcher.dispatch("foo", true);
        dispatcher.dispatch("baz", 'hello');

        expect(stringHandler).toHaveBeenCalledWith({ source, value: 'hello' });
        expect(boolHandler).toHaveBeenCalledWith({ source, value: true });
    });

    it('should throw on missing params', () => {
        const dispatcher = new EventDispatcher<Object, Events>({});
        expect(() => dispatcher.on(null, null)).toThrowError(/missing event name/);
        expect(() => dispatcher.on('foo', null)).toThrowError(/missing event handler/);
    });
});
