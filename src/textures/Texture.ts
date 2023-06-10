import { Observable, Destroy, EventDispatcher, EventHandler } from "@/core";

let TEXTURE_ID = 0;

export type TextureEvents = 'destroy';

/**
 * A 2D texture.
 */
export default class Texture implements Observable<TextureEvents>, Destroy {
    private readonly dispatcher: EventDispatcher<Texture, TextureEvents>;
    /** The width, in pixels. */
    readonly width: number;
    /** The height, in pixels. */
    readonly height: number;
    /** The unique identifier of this texture. */
    readonly id: number;
    /** The underlying pixel buffer. */
    readonly data: BufferSource;

    constructor(options: {
        width: number;
        height: number;
        data: BufferSource;
    }) {
        this.id = TEXTURE_ID++;
        this.width = options.width;
        this.height = options.height;
        this.data = options.data;
        this.dispatcher = new EventDispatcher<Texture, TextureEvents>(this);
    }

    on(type: TextureEvents, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    destroy() {
        this.dispatcher.dispatch("destroy");
    }
}
