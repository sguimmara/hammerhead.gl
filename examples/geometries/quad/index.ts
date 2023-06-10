import chroma from 'chroma-js';
import Context from 'hammerhead.gl/core/Context';
import { deg2rad } from 'hammerhead.gl/core/MathUtils';
import Quad from 'hammerhead.gl/geometries/Quad';
import WireQuad from 'hammerhead.gl/geometries/WireQuad';
import BasicMaterial from 'hammerhead.gl/materials/BasicMaterial';
import { RenderingMode } from 'hammerhead.gl/materials/Material';
import Camera from 'hammerhead.gl/objects/Camera';
import Mesh from 'hammerhead.gl/objects/Mesh';
import { frameObject, load8bitImage } from '../../lib';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const logo = await load8bitImage('/webgpu.png');

    const cube = new Mesh({
        material: new BasicMaterial()
            .withColorTexture(logo),
        geometry: new Quad(),
    });

    const wirecube = new Mesh({
        material: new BasicMaterial({ renderingMode: RenderingMode.LineList}).withDiffuseColor(chroma('black')),
        geometry: new WireQuad(),
    });

    cube.geometry.setColors([
        chroma('red'),
        chroma('green'),
        chroma('blue'),
        chroma('yellow'),
    ]);

    cube.add(wirecube);

    const camera = new Camera('perspective');
    frameObject(cube, camera);
    camera.transform.setPosition(0.5, 0.5, 3);
    camera.transform.lookAt(0, 0, 0);

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