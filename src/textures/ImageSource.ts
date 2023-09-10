import Source, { TextureData } from './Source';

type Input =
    | HTMLImageElement
    | ImageBitmap
    | OffscreenCanvas
    | HTMLCanvasElement;

/**
 * A {@link Source} that comes from a DOM image.
 */
export default class ImageSource implements Source {
    image: Input;
    flipY: boolean = false;
    readonly isGPUImage: boolean = true;

    constructor(image: Input) {
        this.image = image;
    }

    getImage(): TextureData {
        if (this.image instanceof ImageBitmap) {
            return this.image;
        }
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('could not acquire 2d context');
        }
        ctx.drawImage(this.image, 0, 0);

        return canvas;
    }

    get width(): number {
        return this.image.width;
    }

    get height(): number {
        return this.image.height;
    }
}
