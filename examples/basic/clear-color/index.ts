import chroma from 'chroma-js';
import { Context } from 'hammerhead.gl/core';
import { Camera } from 'hammerhead.gl/scene';
import Inspector from '../../Inspector';

export function run(context: Context, pane: Inspector) {
    const renderer = context.renderer;

    const camera = new Camera('perspective');
    function render() {
        renderer.render(null, camera);
    }

    context.on('resized', render);

    const PARAMS = {
        clearColor: {r: 255, g: 0, b: 55},
      };

    pane.exampleFolder.addInput(PARAMS, 'clearColor').on('change', ev => {
        const rgb = ev.value;
        const c = chroma(rgb.r, rgb.g, rgb.b);
        renderer.clearColor = c;
        render();
    })
}
