export class ObservableEvent {
    readonly emitter: object;

    constructor(emitter: object) {
        this.emitter = emitter;
    }
}

export type EventHandler = (event: ObservableEvent) => void;

/**
 * Trait for objects that emit events.
 */
export interface Observable<T> {
    /**
     * Registers an event handler on this object.
     * @param type The event type.
     * @param handler The event handler.
     * @example
     * myObservable.on('destroy', evt => console.info(`${evt.emitter} was destroyed`));
     */
    on(type: T, handler: EventHandler): void;
}

/**
 * Implementation of {@link Observable}
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
