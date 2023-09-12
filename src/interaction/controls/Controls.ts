import { EventDispatcher, EventHandler, Observable } from '@core';
import { Camera } from '@scene';

export interface Events {
    'updated': Controls;
}

export default class Controls implements Observable<Controls, Events> {
    readonly camera: Camera;
    private readonly _dispatcher = new EventDispatcher<this, Events>(this);

    constructor(camera: Camera) {
        this.camera = camera;
    }

    on<K extends keyof Events>(type: K, handler: EventHandler<Controls, Events[K]>): void {
        this._dispatcher.on(type, handler);
    }
}
