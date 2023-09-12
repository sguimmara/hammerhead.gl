import chroma from 'chroma-js';
import { Context, MathUtils } from 'hammerhead.gl/core';
import { BasicMaterial, LineMaterial } from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';

import { loadPLYModel } from '../../lib';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const mesh = await loadPLYModel('/files/hammerhead.ply');
    const wireframe = new LineMaterial().setColor(chroma('black'));

    function createShark() {
        const solid = new BasicMaterial().setDiffuseColor(chroma.random());

        const solidMesh = new Node().setMesh(mesh).setMaterial(solid);
        const wireframeMesh = new Node().setMesh(mesh).setMaterial(wireframe);

        solidMesh.add(wireframeMesh);

        const x = MathUtils.random(250, 2000);
        const y = MathUtils.random(-200, 200);
        const z = MathUtils.random(-500, 500);

        solidMesh.transform.setPosition(x, y, z);

        return solidMesh;
    }

    const root = new Node();
    const sharks: Node[] = [];

    for (let i = 0; i < 100; i++) {
        const shark = createShark();
        root.add(shark);
        sharks.push(shark);
    }
    const camera = new Camera('perspective');
    camera.transform.setPosition(0, 1, 500);
    camera.nearPlane = 1;
    camera.farPlane = 3000;

    function render() {
        renderer.render(root, camera);
    }

    function animate(object: Node, dt: number) {
        const offset = -200 * dt;
        object.transform.translateX(offset);
    }

    let now = performance.now();

    function renderLoop() {
        render();
        const current = performance.now();
        const dt = (current - now) / 1000;
        now = current;

        for (let i = 0; i < sharks.length; i++) {
            const shark = sharks[i];
            animate(shark, dt);
        }

        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main().catch(e => console.error(e));
