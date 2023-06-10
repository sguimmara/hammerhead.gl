import { EventHandler, Observable, ObservableEvent } from "./Observable";

/**
 * Implementation of {@link Observable}
 * @typeParam T The observed object type.
 * @typeParam TEvents The type of events.
 */
export class EventDispatcher<T extends object, TEvents extends string> implements Observable<TEvents> {
    private readonly handlers: Map<string, EventHandler[]>;
    private readonly emitter: T;

    constructor(emitter: T) {
        this.handlers = new Map();
        this.emitter = emitter;
    }

    dispatch(type: TEvents) {
        if (this.handlers.has(type)) {
            const handlers = this.handlers.get(type);
            handlers.forEach(fn => {
                fn(new ObservableEvent(this.emitter));
            });
        }
    }

    on(type: TEvents, handler: EventHandler): void {
        if (!type) {
            throw new Error('missing event name');
        }
        if (!handler) {
            throw new Error('missing event handler');
        }

        if (!this.handlers.has(type)) {
            this.handlers.set(type, [handler]);
        } else {
            this.handlers.get(type).push(handler);
        }
    }
}
