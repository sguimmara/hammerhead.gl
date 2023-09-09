import { EventHandler, Observable, ObservableEvent } from "./Observable";

/**
 * Implementation of {@link Observable}
 * @param T The observed object type.
 * @param TEvents The type of events.
 */
export class EventDispatcher<T extends object, TEvents> implements Observable<T, TEvents> {
    private readonly handlers: Map<string, EventHandler<T, unknown>[]>;
    private readonly emitter: T;

    constructor(emitter: T) {
        this.handlers = new Map();
        this.emitter = emitter;
    }

    dispatch<K extends keyof TEvents>(type: K, value?: TEvents[K]) {
        const key = type as string;
        if (this.handlers.has(key)) {
            const handlers = this.handlers.get(key);
            handlers.forEach(fn => {
                fn(new ObservableEvent<T, TEvents[K]>(this.emitter, value));
            });
        }
    }

    on<K extends keyof TEvents>(type: K, handler: EventHandler<T, TEvents[K]>): void {
        if (!type) {
            throw new Error('missing event name');
        }
        if (!handler) {
            throw new Error('missing event handler');
        }

        const key = type as string;

        if (!this.handlers.has(key)) {
            this.handlers.set(key, [handler]);
        } else {
            this.handlers.get(key).push(handler);
        }
    }
}
