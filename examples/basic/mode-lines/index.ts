import chroma from 'chroma-js';
import { Context, MathUtils } from 'hammerhead.gl/core';
import { LineMaterial } from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';

import { frameObject, loadPLYModel } from '../../lib';
import { Primitive } from 'hammerhead.gl/materials/Material';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const mesh = await loadPLYModel();

    const material = new LineMaterial({ primitive: Primitive.WireTriangles }).setColor(chroma('cyan'));

    const shark = new Node().setMesh(mesh).setMaterial(material);

    const camera = new Camera('perspective');
    frameObject(shark, camera);

    function render() {
        renderer.render(shark, camera);
    }

    let now = performance.now();

    function renderLoop() {
        render();
        const current = performance.now();
        const dt = (current - now) / 1000;
        const degrees = 40 * dt;
        now = current;
        shark.transform.rotateY(MathUtils.deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main().catch(e => console.error(e));
