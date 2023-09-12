import chroma from 'chroma-js';
import { Context } from 'hammerhead.gl/core';
import { ScreenQuad } from 'hammerhead.gl/geometries';
import { BasicMaterial } from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';

import { load8bitImage } from '../../lib';

export async function run(context: Context) {
    const logo = await load8bitImage('/webgpu-transparent.png');
    const renderer = context.renderer;
    renderer.clearColor = chroma('pink');

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Node()
        .setMaterial(material)
        .setMesh(new ScreenQuad());

    const camera = new Camera('orthographic');

    const color1 = chroma('green');
    const color2 = chroma('red');

    function renderLoop() {
        if (renderer.destroyed) {
            return;
        }
        const t = (Math.sin(performance.now() / 250) + 1) / 2;
        renderer.clearColor = chroma.interpolate(color1, color2, t);
        renderer.render(mesh, camera);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}
