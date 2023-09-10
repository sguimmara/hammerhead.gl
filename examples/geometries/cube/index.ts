import chroma from 'chroma-js';
import { Context, MathUtils } from 'hammerhead.gl/core';
import { Cube, WireCube } from 'hammerhead.gl/geometries';
import { BasicMaterial, LineMaterial } from 'hammerhead.gl/materials';
import { Camera, MeshObject } from 'hammerhead.gl/scene';

import { frameObject, load8bitImage } from '../../lib';
import { Primitive } from 'hammerhead.gl/materials/Material';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage('/webgpu.png');
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const cube = new MeshObject({
        material: new BasicMaterial()
            .setDiffuseColor(chroma('yellow'))
            .withColorTexture(logo),
        mesh: new Cube(),
    });

    const wirecube = new MeshObject({
        material: new LineMaterial({ primitive: Primitive.Lines }).setColor(chroma('black')),
        mesh: new WireCube(),
    });

    cube.add(wirecube);
    const camera = new Camera('perspective');
    frameObject(cube, camera);

    function render() {
        renderer.render(cube, camera);
    }

    let now = performance.now();

    function renderLoop() {
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

main().catch(e => console.error(e));
