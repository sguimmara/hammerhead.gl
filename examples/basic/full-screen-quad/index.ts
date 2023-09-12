import { Context } from 'hammerhead.gl/core';
import { ScreenQuad } from 'hammerhead.gl/geometries';
import { BasicMaterial } from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';

import { load8bitImage } from '../../lib';

export async function run(context: Context) {
    const logo = await load8bitImage('/webgpu.png');

    const renderer = context.renderer;

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Node()
        .setMaterial(material)
        .setMesh(new ScreenQuad());

    const camera = new Camera('orthographic');

    function render() {
        if (renderer.destroyed) {
            return;
        }
        renderer.render(mesh, camera);
    }

    render();

    context.on('resized', render);
}
