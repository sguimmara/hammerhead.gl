import Context from './src/Context';
import Mesh from './src/objects/Mesh';
import chroma from 'chroma-js';
import GeometryBuilder from './src/geometries/GeometryBuilder';
import Vector2 from './src/Vec2';
import Texture from './src/textures/Texture';
import BasicMaterial from './src/materials/BasicMaterial';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

let texture: Texture;
const url = 'titmouche.jpg';

function load8bitImage(img: HTMLImageElement, url: string): Promise<Texture> {
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

async function main() {
    const img = new Image();

    texture = await load8bitImage(img, url);

    const context = await Context.create(canvas);
    const renderer = context.renderer;
    const material = new BasicMaterial();
    material.setColorTexture(texture);

    const quad1 = new Mesh({
        material,
        geometry: GeometryBuilder.quad(new Vector2(0.3, 0.3), new Vector2(0.4, 0.4)),
    });
    const quad2 = new Mesh({
        material,
        geometry: GeometryBuilder.quad(new Vector2(-0.5, 0.4), new Vector2(0.2, 0.2)),
    });
    const quad3 = new Mesh({
        material,
        geometry: GeometryBuilder.quad(new Vector2(0.5, 0.8), new Vector2(0.1, 0.1)),
    });

    function render() {
        renderer.clearColor = chroma('white');
        renderer.render([quad1, quad2, quad3]);
        requestAnimationFrame(render);
    }

    render();

    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            const canvas = entry.target as HTMLCanvasElement;
            const width = entry.contentBoxSize[0].inlineSize;
            const height = entry.contentBoxSize[0].blockSize;
            canvas.width = Math.min(width, context.device.limits.maxTextureDimension2D);
            canvas.height = Math.min(height, context.device.limits.maxTextureDimension2D);
            // render();
        }
    });

    observer.observe(canvas);
}

main();