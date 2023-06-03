import Context from '../../../src/core/Context';
import Mesh from '../../../src/objects/Mesh';
import GeometryBuilder from '../../../src/geometries/GeometryBuilder';
import BasicMaterial from '../../../src/materials/BasicMaterial';
import { bindToggle, load8bitImage } from '../../lib';
import Flip from '../../../src/materials/postprocessing/Flip';
import { mat4, vec3 } from 'wgpu-matrix';
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

    const camera = new Camera('orthographic');

    function render() {
        renderer.render(mesh, camera);
    }

    render();

    context.on('resized', render);

    bindToggle('toggle-active', (v: boolean) => {
        mesh.active = v;
        render();
    });

    bindToggle('toggle-active-material', (v: boolean) => {
        mesh.material.active = v;
        render();
    });
}

main();