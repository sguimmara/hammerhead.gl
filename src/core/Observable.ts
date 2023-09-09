export type EventHandler<TSource, T> = (event: ObservableEvent<TSource, T>) => void;

export class ObservableEvent<TSource, T> {
    readonly emitter: TSource;
    readonly value: T;

    constructor(emitter: TSource, value: T) {
        this.emitter = emitter;
        this.value = value;
    }
}

/**
 * Trait for objects that emit events.
 * @typeParam Events The type of events.
 */

export interface Observable<TSource, Events> {
    /**
     * Registers an event handler on this object.
     * @param type The event type.
     * @param handler The event handler.
     * @example
     * myObservable.on('destroy', evt => console.info(`${evt.emitter} was destroyed`));
     */
    on<K extends keyof Events>(type: K, handler: EventHandler<TSource, Events[K]>): void;
}
