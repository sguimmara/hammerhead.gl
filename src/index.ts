import Context from './Context';
import Mesh from './objects/Mesh';
import ScreenQuadMaterial from './materials/ScreenQuadMaterial';
import chroma from 'chroma-js';
import GeometryBuilder from './geometries/GeometryBuilder';
import Vector2 from './Vec2';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

Context.create(canvas)
    .then(ctx => {
        const material = new ScreenQuadMaterial();
        const quad1 = new Mesh({
            material,
            geometry: GeometryBuilder.quad(new Vector2(0.3, 0.3), new Vector2(0.2, 0.2)),
        });
        const quad2 = new Mesh({
            material,
            geometry: GeometryBuilder.quad(new Vector2(-0.5, 0.4), new Vector2(0.2, 0.2)),
        });
        const quad3 = new Mesh({
            material,
            geometry: GeometryBuilder.quad(new Vector2(0.5, 0.8), new Vector2(0.2, 0.2)),
        });

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const canvas = entry.target as HTMLCanvasElement;
                const width = entry.contentBoxSize[0].inlineSize;
                const height = entry.contentBoxSize[0].blockSize;
                canvas.width = Math.min(width, ctx.device.limits.maxTextureDimension2D);
                canvas.height = Math.min(height, ctx.device.limits.maxTextureDimension2D);
                ctx.renderer.clearColor = chroma('pink');
                ctx.renderer.render([quad1, quad2, quad3]);
              }
        });

        observer.observe(canvas);
    })
    .catch(err => {
        console.error(err);
    });