export type EventHandler<TSource, T> = (event: ObservableEvent<TSource, T>) => void;

/**
 * An event emitted by an {@link Observable}
 * @param TSource The type of the event source.
 * @param TArgs The type of the event argument.
 */
export class ObservableEvent<TSource, TArgs> {
    /**
     * The source of the event.
     */
    readonly source: TSource;
    /**
     * The optional argument of the event.
     */
    readonly value: TArgs;

    constructor(source: TSource, value: TArgs) {
        this.source = source;
        this.value = value;
    }
}

/**
 * Trait for objects that emit events.
 * @param TSource The type of the source.
 * @param Events The type of events.
 */

export interface Observable<TSource, Events> {
    /**
     * Registers an event handler on this object.
     * @param type The event type.
     * @param handler The event handler.
     * @example
     * myObservable.on('destroyed', evt => console.info(`${evt.source} was destroyed`));
     */
    on<Type extends keyof Events>(type: Type, handler: EventHandler<TSource, Events[Type]>): void;
}
