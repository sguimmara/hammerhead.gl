import Source from "./Source";

/**
 * A {@link Source} that comes from a DOM image.
 */
export default class ImageSource implements Source {
    image: HTMLImageElement;

    constructor(image: HTMLImageElement) {
        this.image = image;
    }

    getData(): BufferSource {
        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("could not acquire 2d context");
        }
        ctx.drawImage(this.image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return imageData.data;
    }

    get width(): number {
        return this.image.width;
    }

    get height(): number {
        return this.image.height;
    }
}
