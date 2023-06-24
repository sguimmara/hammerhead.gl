import chroma from 'chroma-js';
import { Context, MathUtils } from 'hammerhead.gl/core';
import { BasicMaterial } from 'hammerhead.gl/materials';
import { Camera, MeshObject } from 'hammerhead.gl/scene';

import { frameObject, loadPLYModel } from '../../lib';

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const mesh = await loadPLYModel("/files/hammerhead.ply");

    const material = new BasicMaterial().setDiffuseColor(chroma("cyan"));

    const shark = new MeshObject({ mesh, material });

    const camera = new Camera("perspective");
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

    context.on("resized", render);
}

main();
