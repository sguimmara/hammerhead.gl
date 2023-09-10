import { EventHandler, Observable, ObservableEvent } from './Observable';

/**
 * Implementation of {@link Observable}
 * @param T The observed object type.
 * @param TEvents The type of events.
 */
export class EventDispatcher<TSource extends object, TEvents> implements Observable<TSource, TEvents> {
    private readonly handlers: Map<string, EventHandler<TSource, unknown>[]>;
    private readonly source: TSource;

    constructor(source: TSource) {
        this.handlers = new Map();
        this.source = source;
    }

    dispatch<Type extends keyof TEvents>(type: Type, value?: TEvents[Type]) {
        const key = type as string;
        if (this.handlers.has(key)) {
            const handlers = this.handlers.get(key);
            handlers.forEach(fn => {
                fn(new ObservableEvent<TSource, TEvents[Type]>(this.source, value));
            });
        }
    }

    on<Type extends keyof TEvents>(type: Type, handler: EventHandler<TSource, TEvents[Type]>): void {
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
