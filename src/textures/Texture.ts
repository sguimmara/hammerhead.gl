import { Observable, Destroy, EventDispatcher, EventHandler } from "@/core";

let TEXTURE_ID = 0;

/**
 * A 2D texture.
 */
class Texture implements Observable, Destroy {
    private readonly dispatcher: EventDispatcher<Texture>;
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
        this.dispatcher = new EventDispatcher<Texture>(this);
    }

    on(type: string, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    destroy() {
        this.dispatcher.dispatch("destroy");
    }
}

export default Texture;
