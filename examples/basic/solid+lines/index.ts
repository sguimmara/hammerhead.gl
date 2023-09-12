import chroma from 'chroma-js';
import { Context, MathUtils } from 'hammerhead.gl/core';
import { BasicMaterial } from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';

import { frameObject, loadPLYModel } from '../../lib';
import LineMaterial from 'hammerhead.gl/materials/LineMaterial';
import Inspector from '../../Inspector';

export async function run(context: Context, pane: Inspector) {
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const mesh = await loadPLYModel('/files/hammerhead.ply');
    const solid = new BasicMaterial().setDiffuseColor(chroma('cyan'));

    const wireframe = new LineMaterial().setColor(chroma('black'));

    const solidMesh = new Node().setMesh(mesh).setMaterial(solid);
    const wireframeMesh = new Node().setMesh(mesh).setMaterial(wireframe);
    solidMesh.add(wireframeMesh);
    const camera = new Camera('perspective');
    frameObject(solidMesh, camera);

    function render() {
        renderer.render(solidMesh, camera);
    }

    let now = performance.now();

    function renderLoop() {
        if (renderer.destroyed) {
            return;
        }
        render();
        const current = performance.now();
        const dt = (current - now) / 1000;
        const degrees = 40 * dt;
        now = current;
        solidMesh.transform.rotateY(MathUtils.deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);

    const params = {
        offset: 0.002,
    };
    pane.exampleFolder.addInput(params, 'offset', {
        label: 'wireframe offset',
        min: -1,
        max: 1,
    }).on('change', (ev) => wireframe.withLineOffset(ev.value));
}
