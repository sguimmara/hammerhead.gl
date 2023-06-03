import Context from '../../../src/core/Context';
import Mesh from '../../../src/objects/Mesh';
import GeometryBuilder from '../../../src/geometries/GeometryBuilder';
import BasicMaterial from '../../../src/materials/BasicMaterial';
import { load8bitImage } from '../../lib';
import chroma from 'chroma-js';
import { mat4, vec3 } from 'wgpu-matrix';
import { deg2rad } from '../../../src/core/MathUtils';
import Camera from '../../../src/objects/Camera';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const material = new BasicMaterial();

    const mesh = new Mesh({
        material,
        geometry: GeometryBuilder.pyramid(),
    });

    mesh.geometry.setColors([
        chroma('red'),
        chroma('green'),
        chroma('blue'),
        chroma('yellow'),
    ]);

    const camera = new Camera('perspective');
    camera.setPosition(0, 3, 5);
    camera.lookAt(0, 0, 0);

    function render() {
        renderer.render(mesh, camera);
    }

    let now = performance.now();
    let rotation = 0;

    mesh.setScale(1.2, 1.2, 1.2);

    function renderLoop() {
        render();
        const current = performance.now();
        const dt = (current - now) / 1000;
        const degrees = 40 * dt;
        rotation += degrees;
        now = current;
        mat4.rotateY(mesh.localMatrix, deg2rad(degrees), mesh.localMatrix);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();