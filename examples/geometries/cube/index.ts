import chroma from 'chroma-js';
import { Context, MathUtils } from 'hammerhead.gl/core';
import { Cube, WireCube } from 'hammerhead.gl/geometries';
import { BasicMaterial, LineMaterial } from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';

import { frameObject, load8bitImage } from '../../lib';
import { Primitive } from 'hammerhead.gl/materials/Material';

export async function run(context: Context) {
    const logo = await load8bitImage('/webgpu.png');
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    // TODO put textures on side of cube
    const cube = new Node()
        .setMesh(new Cube())
        .setMaterial(new BasicMaterial()
            .setDiffuseColor(chroma('yellow'))
            .withColorTexture(logo))

    const wirecube = new Node()
        .setMaterial(new LineMaterial({ primitive: Primitive.Lines }).setColor(chroma('black')))
        .setMesh(new WireCube());

    cube.add(wirecube);
    const camera = new Camera('perspective');
    frameObject(cube, camera);

    function render() {
        renderer.render(cube, camera);
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
        cube.transform.rotateY(MathUtils.deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}
