import Context from '../../../src/core/Context';
import Mesh from '../../../src/objects/Mesh';
import GeometryBuilder from '../../../src/geometries/GeometryBuilder';
import BasicMaterial from '../../../src/materials/BasicMaterial';
import { load8bitImage } from '../../lib';
import chroma from 'chroma-js';

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

    mesh.geometry.setColors(chroma('red'));

    function render() {
        renderer.render(mesh);
    }

    render();

    context.on('resized', render);
}

main();