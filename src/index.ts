import chroma from 'chroma-js';
import Context from './Context';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

Context.create(canvas)
    .then(ctx => {
        // ctx.clearCanvas(chroma.rgb(0, 255, 255, 255));
        ctx.renderTriangleRgb();

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const canvas = entry.target as HTMLCanvasElement;
                const width = entry.contentBoxSize[0].inlineSize;
                const height = entry.contentBoxSize[0].blockSize;
                canvas.width = Math.min(width, ctx.device.limits.maxTextureDimension2D);
                canvas.height = Math.min(height, ctx.device.limits.maxTextureDimension2D);
                // re-render
                ctx.renderTriangleRgb();
              }
        });

        observer.observe(canvas);
    })
    .catch(err => {
        console.error(err);
    });