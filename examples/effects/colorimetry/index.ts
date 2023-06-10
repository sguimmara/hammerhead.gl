import Context from 'hammerhead.gl/core/Context';
import GeometryBuilder from 'hammerhead.gl/geometries/GeometryBuilder';
import BasicMaterial from 'hammerhead.gl/materials/BasicMaterial';
import Colorimetry from 'hammerhead.gl/materials/postprocessing/Colorimetry';
import Camera from 'hammerhead.gl/objects/Camera';
import Mesh from 'hammerhead.gl/objects/Mesh';

import { bindSlider, load8bitImage } from '../../lib';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage('/webgpu.png');

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

    const camera = new Camera('orthographic');

    function render() {
        renderer.render(mesh, camera);
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