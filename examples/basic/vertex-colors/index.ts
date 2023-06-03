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
    const img = new Image();

    const logo = await load8bitImage(img, '/webgpu.png');

    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Mesh({
        material,
        geometry: GeometryBuilder.screenQuad(),
    });


    mesh.geometry.setColors([
        chroma('red'),
        chroma('green'),
        chroma('blue'),
        chroma('cyan'),
    ]);

    const camera = new Camera('perspective');
    camera.setPosition(0, 0, -10);

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
        const sx = ((Math.sin(performance.now() / 1000) + 1) / 2);
        mat4.scaling(vec3.create(sx, sx, 1), mesh.worldMatrix);
        mat4.rotateZ(mesh.worldMatrix, deg2rad(rotation), mesh.worldMatrix);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();