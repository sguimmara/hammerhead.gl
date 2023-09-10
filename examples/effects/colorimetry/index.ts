import { Context } from 'hammerhead.gl/core';
import { ScreenQuad } from 'hammerhead.gl/geometries';
import { BasicMaterial } from 'hammerhead.gl/materials';
import { Colorimetry } from 'hammerhead.gl/materials/postprocessing';
import { Camera, MeshObject } from 'hammerhead.gl/scene';

import { load8bitImage } from '../../lib';
import { Pane } from 'tweakpane';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage('/webgpu.png');

    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const colorimetry = new Colorimetry({
        saturation: 1,
        brightness: 1,
    });

    renderer.setRenderStages([colorimetry]);

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new MeshObject({
        material,
        mesh: new ScreenQuad(),
    });

    const camera = new Camera('orthographic');

    function render() {
        renderer.render(mesh, camera);
    }

    render();

    context.on('resized', render);

    const pane = new Pane();

    const params = {
        saturation: 1,
        brightness: 1,
    };

    pane.addInput(params, 'saturation', { min: 0, max: 3 })
        .on('change', ev => {
            colorimetry.withSaturation(ev.value);
            render();
        });
    pane.addInput(params, 'brightness', { min: 0, max: 3 })
        .on('change', ev => {
            colorimetry.withBrightness(ev.value);
            render()
        });
}

main();
