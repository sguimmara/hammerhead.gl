import { Context } from 'hammerhead.gl/core';
import { ScreenQuad } from 'hammerhead.gl/geometries';
import { BasicMaterial } from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';

import { load8bitImage } from '../../lib';
import Inspector from '../../Inspector';

export async function run(context: Context, inspector: Inspector) {
    const logo = await load8bitImage('/webgpu.png');
    const renderer = context.renderer;

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
        mesh: mesh.active,
        material: material.active,
    };

    inspector.exampleFolder.addInput(params, 'mesh')
        .on('change', ev => {
            mesh.active = ev.value;
            render();
        });
    inspector.exampleFolder.addInput(params, 'material')
        .on('change', ev => {
            material.active = ev.value;
            render()
        });
}
