import Context from '../../src/core/Context';
import chroma from 'chroma-js';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    function render() {
        renderer.clearColor = chroma.random();
        renderer.render();
    }

    setInterval(render, 500);

    context.on('resized', render);
}

main();