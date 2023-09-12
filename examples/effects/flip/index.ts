import { Context } from 'hammerhead.gl/core';
import { ScreenQuad } from 'hammerhead.gl/geometries';
import { BasicMaterial } from 'hammerhead.gl/materials';
import { Flip } from 'hammerhead.gl/materials/postprocessing';
import { Camera, Node } from 'hammerhead.gl/scene';

import { load8bitImage } from '../../lib';
import Inspector from '../../Inspector';

export async function run(context: Context, inspector: Inspector) {
    const logo = await load8bitImage('/webgpu.png');

    const renderer = context.renderer;

    const flip = new Flip();

    renderer.setRenderStages([flip]);

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Node()
        .setMaterial(material)
        .setMesh(new ScreenQuad());

    const camera = new Camera('orthographic');

    function render() {
        renderer.render(mesh, camera);
    }

    render();

    context.on('resized', render);

    const params = {
        flipX: false,
        flipY: false,
    };

    inspector.exampleFolder.addInput(params, 'flipX')
        .on('change', ev => {
            flip.withFlipX(ev.value);
            render();
        });
    inspector.exampleFolder.addInput(params, 'flipY')
        .on('change', ev => {
            flip.withFlipY(ev.value);
            render()
        });
}
