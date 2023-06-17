import { Observable, Destroy, EventDispatcher, EventHandler } from "@/core";
import Source from "./Source";

let TEXTURE_ID = 0;

export type TextureEvents = 'destroy';

/**
 * A 2D texture.
 */
export default class Texture implements Observable<TextureEvents>, Destroy {
    private readonly dispatcher: EventDispatcher<Texture, TextureEvents>;
    /** The unique identifier of this texture. */
    readonly id: number;
    /** The data source. */
    readonly source: Source;

    label: string;

    constructor(options: {
        source?: Source;
    } = {}) {
        this.id = TEXTURE_ID++;
        this.source = options.source;
        this.dispatcher = new EventDispatcher<Texture, TextureEvents>(this);
    }

    on(type: TextureEvents, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    destroy() {
        this.dispatcher.dispatch("destroy");
    }
}
