import Context from '../../../src/core/Context';
import Mesh from '../../../src/objects/Mesh';
import GeometryBuilder from '../../../src/geometries/GeometryBuilder';
import BasicMaterial from '../../../src/materials/BasicMaterial';
import { bindSlider, load8bitImage } from '../../lib';
import Colorimetry from '../../../src/materials/postprocessing/Colorimetry';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const img = new Image();

    const logo = await load8bitImage(img, '/webgpu.png');

    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const colorimetry = new Colorimetry({
        saturation: 1,
        brightness: 1,
    });

    renderer.setRenderStages([colorimetry]);

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

    bindSlider('slider-saturation', (v: number) => {
        colorimetry.withSaturation(v);
        render();
    });

    bindSlider('slider-brightness', (v: number) => {
        colorimetry.withBrightness(v);
        render();
    });
}

main();