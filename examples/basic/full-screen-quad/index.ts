import Context from 'hammerhead.gl/core/Context';
import GeometryBuilder from 'hammerhead.gl/geometries/GeometryBuilder';
import BasicMaterial from 'hammerhead.gl/materials/BasicMaterial';
import Camera from 'hammerhead.gl/objects/Camera';
import Mesh from 'hammerhead.gl/objects/Mesh';

import { load8bitImage } from '../../lib';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage('/webgpu.png');

    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Mesh({
        material,
        geometry: GeometryBuilder.screenQuad(),
    });

    const camera = new Camera('orthographic');

    function render() {
        renderer.render(mesh, camera);
    }

    render();

    context.on('resized', render);
}

main();