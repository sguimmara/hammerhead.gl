import chroma from 'chroma-js';
import { Context, MathUtils } from 'hammerhead.gl/core';
import { Object3D, MeshObject, Camera } from 'hammerhead.gl/scene';
import { BoundsHelper } from 'hammerhead.gl/helpers';
import { BasicMaterial } from 'hammerhead.gl/materials';
import { frameBounds, loadPLYModel } from '../../lib';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const mesh = await loadPLYModel('/files/hammerhead.ply');
    const cyan = new BasicMaterial({
        frontFace: 'ccw',
    }).withDiffuseColor(chroma('cyan'));
    const purple = new BasicMaterial({
        frontFace: 'ccw',
    }).withDiffuseColor(chroma('purple'));
    const wireframe = new BasicMaterial().withDiffuseColor(chroma('black'));

    const shark1 = new MeshObject({ mesh, material: cyan});
    const wireframe1 = new MeshObject({ mesh, material: wireframe});
    shark1.add(wireframe1);

    const shark2 = new MeshObject({ mesh, material: purple});
    const wireframe2 = new MeshObject({ mesh, material: wireframe});
    shark2.add(wireframe2);

    const camera = new Camera('perspective');

    const root = new Object3D();
    root.label = 'root';

    root.add(shark1);
    root.add(shark2);

    shark1.transform.setPosition(0, 0, 100);
    shark2.transform.setPosition(0, 0, -100);

    const shark1Bounds = new BoundsHelper({ source: shark1, color: chroma('cyan')});
    const shark2Bounds = new BoundsHelper({ source: shark2, color: chroma('purple')});
    const rootBounds = new BoundsHelper({ source: root, color: chroma('yellow')});

    root.add(shark1Bounds);
    root.add(shark2Bounds);
    root.add(rootBounds);

    frameBounds(root.getWorldBounds(), camera);

    function render() {
        renderer.render(root, camera);
    }

    let now = performance.now();

    function renderLoop() {
        const current = performance.now();
        const dt = (current - now) / 1000;
        const degrees = 40 * dt;
        now = current;
        shark1.transform.rotateY(MathUtils.deg2rad(degrees));
        shark1.transform.rotateZ(MathUtils.deg2rad(degrees));
        shark1.transform.rotateX(MathUtils.deg2rad(degrees));

        shark2.transform.rotateX(MathUtils.deg2rad(degrees));
        shark2.transform.rotateZ(MathUtils.deg2rad(-degrees));
        shark2.transform.rotateY(MathUtils.deg2rad(degrees));

        shark1.transform.setPosition(Math.sin(current * 0.01) * 10, 0, 100);
        shark2.transform.setPosition(0, Math.sin(current * 0.01) * 10, -100);

        shark1Bounds.update();
        shark2Bounds.update();
        rootBounds.update();

        frameBounds(root.getWorldBounds(), camera);
        render();
        requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();
