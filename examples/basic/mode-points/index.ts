import chroma from 'chroma-js';
import { Context, MathUtils } from 'hammerhead.gl/core';
import { PointMaterial } from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';

import { frameObject, loadPLYModel } from '../../lib';
import { Pane } from 'tweakpane';
import { BoundsHelper } from 'hammerhead.gl/helpers';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const mesh = await loadPLYModel();

    const material = new PointMaterial().setColor(chroma('cyan'));

    const shark = new Node().setMesh(mesh).setMaterial(material);
    const bounds = new BoundsHelper({ source: shark });
    const camera = new Camera('perspective');
    shark.add(bounds);
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

    const pane = new Pane();

    const params = {
        pointSize: 2,
    };

    pane.addInput(params, 'pointSize', { min: 0, max: 20 })
        .on('change', ev => {
            material.setPointSize(ev.value);
            render();
        });
}

main().catch(e => console.error(e));
