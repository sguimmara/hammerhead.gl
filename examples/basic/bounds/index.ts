import chroma from 'chroma-js';
import Context from 'hammerhead.gl/core/Context';
import { deg2rad } from 'hammerhead.gl/core/MathUtils';
import BoundsHelper from 'hammerhead.gl/helpers/BoundsHelper';
import BasicMaterial from 'hammerhead.gl/materials/BasicMaterial';
import { FrontFace, RenderingMode } from 'hammerhead.gl/materials/Material';
import Camera from 'hammerhead.gl/objects/Camera';
import Mesh from 'hammerhead.gl/objects/Mesh';
import Object3D from 'hammerhead.gl/objects/Object3D';

import { frameBounds, loadPLYModel } from '../../lib';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const geometry = await loadPLYModel('/files/hammerhead.ply');
    const cyan = new BasicMaterial({
        frontFace: FrontFace.CCW,
    }).withDiffuseColor(chroma('cyan'));
    const purple = new BasicMaterial({
        frontFace: FrontFace.CCW,
    }).withDiffuseColor(chroma('purple'));
    const wireframe = new BasicMaterial({ renderingMode: RenderingMode.TriangleLines }).withDiffuseColor(chroma('black'));

    const shark1 = new Mesh({ geometry, material: cyan});
    const wireframe1 = new Mesh({ geometry, material: wireframe});
    shark1.add(wireframe1);

    const shark2 = new Mesh({ geometry, material: purple});
    const wireframe2 = new Mesh({ geometry, material: wireframe});
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
        shark1.transform.rotateY(deg2rad(degrees));
        shark1.transform.rotateZ(deg2rad(degrees));
        shark1.transform.rotateX(deg2rad(degrees));

        shark2.transform.rotateX(deg2rad(degrees));
        shark2.transform.rotateZ(deg2rad(-degrees));
        shark2.transform.rotateY(deg2rad(degrees));

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