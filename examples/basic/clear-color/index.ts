import Context from '../../../src/core/Context';
import chroma from 'chroma-js';
import Camera from '../../../src/objects/Camera';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const camera = new Camera('perspective');
    function render() {
        renderer.clearColor = chroma.random();
        renderer.render(null, camera);
    }

    setInterval(render, 500);

    context.on('resized', render);
}

main();