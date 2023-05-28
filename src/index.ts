import Context from './Context';
import Mesh from './objects/Mesh';
import ScreenQuadMaterial from './materials/ScreenQuadMaterial';
import chroma from 'chroma-js';
import GeometryBuilder from './geometries/GeometryBuilder';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

Context.create(canvas)
    .then(ctx => {
        const quad = new Mesh({
            material: new ScreenQuadMaterial(),
            geometry: GeometryBuilder.screenQuad(),
        });
        ctx.renderer.clearColor = chroma('pink');
        ctx.renderer.render([quad]);

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const canvas = entry.target as HTMLCanvasElement;
                const width = entry.contentBoxSize[0].inlineSize;
                const height = entry.contentBoxSize[0].blockSize;
                canvas.width = Math.min(width, ctx.device.limits.maxTextureDimension2D);
                canvas.height = Math.min(height, ctx.device.limits.maxTextureDimension2D);
                ctx.renderer.render([quad]);
              }
        });

        observer.observe(canvas);
    })
    .catch(err => {
        console.error(err);
    });