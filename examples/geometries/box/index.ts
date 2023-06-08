import Context from '../../../src/core/Context';
import Mesh from '../../../src/objects/Mesh';
import BasicMaterial from '../../../src/materials/BasicMaterial';
import chroma from 'chroma-js';
import Camera from '../../../src/objects/Camera';
import Box from '../../../src/geometries/Box';
import { CullingMode, FrontFace, RenderingMode } from '../../../src/materials/Material';
import { deg2rad } from '../../../src/core/MathUtils';
import { frameObject } from '../../lib';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const material = new BasicMaterial({ renderingMode: RenderingMode.Lines })
        .withDiffuseColor(chroma('yellow'));

    const mesh = new Mesh({
        material,
        geometry: new Box(),
    });

    const camera = new Camera('perspective');
    frameObject(mesh, camera);

    function render() {
        renderer.render(mesh, camera);
    }

    let now = performance.now();
    let rotation = 0;

    function renderLoop() {
        render();
        const current = performance.now();
        const dt = (current - now) / 1000;
        const degrees = 40 * dt;
        rotation += degrees;
        now = current;
        mesh.transform.rotateY(deg2rad(degrees));
        // mesh.transform.rotateX(deg2rad(degrees));
        // mesh.transform.rotateZ(deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();