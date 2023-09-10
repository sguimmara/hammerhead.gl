import { Context } from 'hammerhead.gl/core';
import { ScreenQuad } from 'hammerhead.gl/geometries';
import { BasicMaterial } from 'hammerhead.gl/materials';
import { Flip } from 'hammerhead.gl/materials/postprocessing';
import { Camera, MeshObject } from 'hammerhead.gl/scene';
import { Pane } from 'tweakpane';

import { load8bitImage } from '../../lib';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage('/webgpu.png');

    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const flip = new Flip();

    renderer.setRenderStages([flip]);

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
        flipX: false,
        flipY: false,
    };

    pane.addInput(params, 'flipX')
        .on('change', ev => {
            flip.withFlipX(ev.value);
            render();
        });
    pane.addInput(params, 'flipY')
        .on('change', ev => {
            flip.withFlipY(ev.value);
            render()
        });
}

main().catch(e => console.error(e));
