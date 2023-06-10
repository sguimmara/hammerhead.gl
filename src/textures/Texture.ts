import { Observable, Destroy, EventDispatcher, EventHandler } from "@/core";

let TEXTURE_ID = 0;

class Texture implements Observable, Destroy {
    private readonly dispatcher: EventDispatcher<Texture>;
    readonly width: number;
    readonly height: number;
    readonly id: number;
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
