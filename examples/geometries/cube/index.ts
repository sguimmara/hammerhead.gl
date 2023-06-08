import Context from '../../../src/core/Context';
import Mesh from '../../../src/objects/Mesh';
import BasicMaterial from '../../../src/materials/BasicMaterial';
import chroma from 'chroma-js';
import Camera from '../../../src/objects/Camera';
import Cube from '../../../src/geometries/Cube';
import { RenderingMode } from '../../../src/materials/Material';
import { deg2rad } from '../../../src/core/MathUtils';
import { frameObject } from '../../lib';
import WireCube from '../../../src/geometries/WireCube';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const cube = new Mesh({
        material: new BasicMaterial().withDiffuseColor(chroma('yellow')),
        geometry: new Cube(),
    });

    const wirecube = new Mesh({
        material: new BasicMaterial({ renderingMode: RenderingMode.LineList}).withDiffuseColor(chroma('black')),
        geometry: new WireCube(),
    });

    cube.add(wirecube);
    const camera = new Camera('perspective');
    frameObject(cube, camera);

    function render() {
        renderer.render(cube, camera);
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
        cube.transform.rotateY(deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();