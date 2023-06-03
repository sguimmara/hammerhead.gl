import Context from '../../../src/core/Context';
import Mesh from '../../../src/objects/Mesh';
import GeometryBuilder from '../../../src/geometries/GeometryBuilder';
import BasicMaterial from '../../../src/materials/BasicMaterial';
import { load8bitImage } from '../../lib';
import { mat4, vec3 } from 'wgpu-matrix';
import Camera from '../../../src/objects/Camera';
import chroma from 'chroma-js';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const img = new Image();

    const logo = await load8bitImage(img, '/webgpu-transparent.png');

    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('pink');

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Mesh({
        material,
        geometry: GeometryBuilder.screenQuad(),
    });

    const camera = new Camera('orthographic');

    const color1 = chroma('green');
    const color2 = chroma('red');

    function renderLoop() {
        const t = (Math.sin(performance.now() / 250) + 1) / 2;
        renderer.clearColor = chroma.interpolate(color1, color2, t);
        renderer.render(mesh, camera);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

main();