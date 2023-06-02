import Texture from "../src/textures/Texture";

export function bindSlider(elementId: string, fn: Function) {
    const slider = document.getElementById(elementId) as HTMLInputElement;
    if (slider) {
        slider.oninput = () => {
            fn(slider.value);
        }
    }
}

export function load8bitImage(img: HTMLImageElement, url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onerror = reject;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('could not acquire 2d context');
            }
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const texture = new Texture({
                width: img.width,
                height: img.height,
                data: data.data
            });
            resolve(texture);
        }
    });
}