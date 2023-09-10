import chroma from 'chroma-js';
import { Context } from 'hammerhead.gl/core';
import { Camera } from 'hammerhead.gl/scene';
import { Pane } from 'tweakpane';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const camera = new Camera('perspective');
    function render() {
        renderer.render(null, camera);
    }

    setInterval(render, 500);

    context.on('resized', render);

    const PARAMS = {
        clearColor: {r: 255, g: 0, b: 55},
      };

    const pane = new Pane();

    pane.addInput(PARAMS, 'clearColor').on('change', ev => {
        const rgb = ev.value;
        const c = chroma(rgb.r, rgb.g, rgb.b);
        renderer.clearColor = c;
        render();
    })
}

main();
