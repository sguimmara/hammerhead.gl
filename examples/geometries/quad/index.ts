import chroma from 'chroma-js';
import { Context, MathUtils } from 'hammerhead.gl/core';
import { Quad, WireQuad } from 'hammerhead.gl/geometries';
import { BasicMaterial, LineMaterial } from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';

import { frameObject, load8bitImage } from '../../lib';
import { Primitive } from 'hammerhead.gl/materials/Material';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const logo = await load8bitImage('/webgpu.png');

    const cube = new Node()
        .setMaterial(new BasicMaterial().withColorTexture(logo))
        .setMesh(new Quad());

    const wirecube = new Node()
        .setMaterial(new LineMaterial({ primitive: Primitive.Lines})
            .setColor(chroma('black')))
        .setMesh(new WireQuad());

    const colors = [
        chroma('red'),
        chroma('green'),
        chroma('blue'),
        chroma('yellow'),
    ];

    cube.mesh.setAttribute('color', new Float32Array(colors.flatMap(c => c.gl())));

    cube.add(wirecube);

    const camera = new Camera('perspective');
    frameObject(cube, camera);
    camera.transform.setPosition(0.5, 0.5, 3);
    camera.transform.lookAt(0, 0, 0);

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
