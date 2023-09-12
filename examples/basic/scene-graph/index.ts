import chroma from 'chroma-js';
import { Box3, Context, MathUtils } from 'hammerhead.gl/core';
import {
    BasicMaterial, LineMaterial,
} from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';
import { vec3 } from 'wgpu-matrix';

import { frameBounds, loadPLYModel, wait } from '../../lib';

export async function run(context: Context) {
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const mesh = await loadPLYModel('/files/hammerhead.ply');

    function makeMesh(x: number, y: number, z: number, color: string) {
        const object = new Node()
            .setMaterial(new BasicMaterial().setDiffuseColor(chroma(color)))
           .setMesh(mesh);

        object.label = color;

        const wireframeMesh = new Node()
            .setMaterial(new LineMaterial().setColor(chroma.mix(chroma('black'), color, 0.2)))
           .setMesh(mesh);

        wireframeMesh.label = color + '/wireframe';

        object.add(wireframeMesh);
        object.transform.setPosition(x, y, z);

        return object;
    }

    const root = new Node();
    root.label = 'root';
    const left = new Node();
    left.label = 'left';
    const right = new Node();
    right.label = 'right';
    root.transform.setPosition(0, 100, 0);
    left.transform.setPosition(0, -100, -100);
    right.transform.setPosition(0, -100, 100);
    root.add(left);
    root.add(right);
    root.add(makeMesh(0, 0, 0, 'red'));

    left.add(makeMesh(0, 0, -50, 'yellow'));
    left.add(makeMesh(0, 0, +50, 'orange'));
    right.add(makeMesh(0, 0, -50, 'lightgreen'));
    right.add(makeMesh(0, 0, +50, 'cyan'));

    const camera = new Camera('perspective');
    camera.nearPlane = 1;
    camera.farPlane = 10000;

    const size = 150;
    const bounds = new Box3({
        min: vec3.create(-size, -size, -size),
        max: vec3.create(+size, +size, +size),
    });
    frameBounds(bounds, camera);

    function render() {
        renderer.render(root, camera);
    }

    async function animateRotation(object: Node) {
        let now = performance.now();
        let rotation = 0;
        const speed = 500;

        while (rotation < 180) {
            const current = performance.now();
            const dt = (current - now) / 1000;
            const degrees = speed * dt;
            now = current;
            object.transform.rotateY(MathUtils.deg2rad(degrees));
            rotation += degrees;
            await wait(16);
        }
        while (rotation > 0) {
            const current = performance.now();
            const dt = (current - now) / 1000;
            const degrees = -speed * dt;
            now = current;
            object.transform.rotateY(MathUtils.deg2rad(degrees));
            rotation += degrees;
            await wait(16);
        }

        // Reset rotation
        object.transform.rotateY(MathUtils.deg2rad(-rotation));
    }

    function renderLoop() {
        if (renderer.destroyed) {
            return;
        }
        render();
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
    context.on('resized', render);

    const loop = [
        root,
        left,
        right,
        left.children[0],
        left.children[1],
        right.children[0],
        right.children[1],
    ];

    let i = 0;
    for (;;) {
        await animateRotation(loop[i]);
        i++;
        if (i === loop.length) {
            i = 0;
        }
    }
}
