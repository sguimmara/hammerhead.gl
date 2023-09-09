import { Observable, Destroy, EventDispatcher, EventHandler } from "@/core";
import Source from "./Source";

let TEXTURE_ID = 0;

export interface Events {
    'destroy': undefined;
}

/**
 * A 2D texture.
 */
export default class Texture implements Observable<Texture, Events>, Destroy {
    private readonly dispatcher: EventDispatcher<Texture, Events>;
    /** The unique identifier of this texture. */
    readonly id: number;
    /** The data source. */
    readonly source: Source;

    label: string;
    format: GPUTextureFormat = 'rgba8unorm';

    constructor(options: {
        source?: Source;
    } = {}) {
        this.id = TEXTURE_ID++;
        this.source = options.source;
        this.dispatcher = new EventDispatcher<Texture, Events>(this);
    }

    on<K extends keyof Events>(type: K, handler: EventHandler<Texture, Events[K]>): void {
        this.dispatcher.on(type, handler);
    }

    destroy() {
        this.dispatcher.dispatch("destroy");
    }
}
