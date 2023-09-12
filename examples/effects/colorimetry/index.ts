import { Context } from 'hammerhead.gl/core';
import { ScreenQuad } from 'hammerhead.gl/geometries';
import { BasicMaterial } from 'hammerhead.gl/materials';
import { Colorimetry } from 'hammerhead.gl/materials/postprocessing';
import { Camera, Node } from 'hammerhead.gl/scene';

import { load8bitImage } from '../../lib';
import Inspector from '../../Inspector';

export async function run(context: Context, inspector: Inspector) {
    const logo = await load8bitImage('/webgpu.png');
    const renderer = context.renderer;

    const colorimetry = new Colorimetry({
        saturation: 1,
        brightness: 1,
    });

    renderer.setRenderStages([colorimetry]);

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Node()
        .setMaterial(material)
        .setMesh(new ScreenQuad())

    const camera = new Camera('orthographic');

    function render() {
        renderer.render(mesh, camera);
    }

    render();

    context.on('resized', render);

    const params = {
        saturation: 1,
        brightness: 1,
    };

    inspector.exampleFolder.addInput(params, 'saturation', { min: 0, max: 3 })
        .on('change', ev => {
            colorimetry.withSaturation(ev.value);
            render();
        });
    inspector.exampleFolder.addInput(params, 'brightness', { min: 0, max: 3 })
        .on('change', ev => {
            colorimetry.withBrightness(ev.value);
            render()
        });
}
