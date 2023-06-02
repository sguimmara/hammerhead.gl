import Context from '../../../src/core/Context';
import Mesh from '../../../src/objects/Mesh';
import GeometryBuilder from '../../../src/geometries/GeometryBuilder';
import BasicMaterial from '../../../src/materials/BasicMaterial';
import { bindSlider, bindToggle, load8bitImage } from '../../lib';
import Flip from '../../../src/materials/postprocessing/Flip';
import { mat4, vec3 } from 'wgpu-matrix';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const img = new Image();

    const logo = await load8bitImage(img, '/webgpu.png');

    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const flip = new Flip();

    renderer.setRenderStages([flip]);

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Mesh({
        material,
        geometry: GeometryBuilder.screenQuad(),
    });

    function render() {
        renderer.render(mesh);
    }

    render();

    context.on('resized', render);

    bindToggle('toggle-flip-x', (v: boolean) => {
        flip.withFlipX(v);
        render();
    });

    bindToggle('toggle-flip-y', (v: boolean) => {
        flip.withFlipY(v);
        render();
    });
}

main();