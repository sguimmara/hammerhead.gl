export type EventHandler = (event: ObservableEvent) => void;

export class ObservableEvent {
    readonly emitter: object;

    constructor(emitter: object) {
        this.emitter = emitter;
    }
}

/**
 * Trait for objects that emit events.
 * @typeParam Events The type of events.
 */

export interface Observable<Events extends string> {
    /**
     * Registers an event handler on this object.
     * @param type The event type.
     * @param handler The event handler.
     * @example
     * myObservable.on('destroy', evt => console.info(`${evt.emitter} was destroyed`));
     */
    on(type: Events, handler: EventHandler): void;
}
