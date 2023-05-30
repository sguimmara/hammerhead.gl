export class ObservableEvent {
    readonly emitter: object;

    constructor(emitter: object) {
        this.emitter = emitter;
    }
}

export type EventHandler = (event: ObservableEvent) => void;
export type EventType = 'disposed' | string;

export interface Observable {
    /**
     * Registers an event handler on this object.
     * @param type The event type.
     * @param handler The event handler.
     */
    on(type: EventType, handler: EventHandler): void;
}

export class EventDispatcher<T extends object> implements Observable {
    private readonly handlers: Map<string, EventHandler[]>;
    private readonly emitter: T;

    constructor(emitter: T) {
        this.handlers = new Map();
        this.emitter = emitter;
    }

    dispatch(type: string) {
        if (this.handlers.has(type)) {
            const handlers = this.handlers.get(type);
            handlers.forEach(fn => {
                fn(new ObservableEvent(this.emitter));
            });
        }
    }

    on(type: EventType, handler: EventHandler): void {
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