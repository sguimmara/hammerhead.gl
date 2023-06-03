import chroma from "chroma-js";
import Context from "../../../../src/core/Context";
import { deg2rad } from "../../../../src/core/MathUtils";
import GeometryBuilder from "../../../../src/geometries/GeometryBuilder";
import BasicMaterial from "../../../../src/materials/BasicMaterial";
import Camera from "../../../../src/objects/Camera";
import Mesh from "../../../../src/objects/Mesh";
import OBJLoader from '../../../../src/loaders/OBJLoader';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const loader = new OBJLoader();

    const mesh = await loader.loadFromURI('/files/lamp.obj');

    const camera = new Camera('perspective');
    camera.setPosition(0, 3, 5);
    camera.lookAt(0, 0, 0);

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
        mesh.transform.rotateY(deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();