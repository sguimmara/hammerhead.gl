import Context from "../../../src/core/Context";
import { deg2rad } from "../../../src/core/MathUtils";
import Camera from "../../../src/objects/Camera";
import BasicMaterial from "../../../src/materials/BasicMaterial";
import chroma from "chroma-js";
import { frameObject, loadPLYModel } from "../../lib";
import Mesh from "../../../src/objects/Mesh";
import { RenderingMode } from "../../../src/materials/Material";

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const geometry = await loadPLYModel('/files/hammerhead.ply');
    const material = new BasicMaterial({ mode: RenderingMode.Points }).withDiffuseColor(chroma('cyan'));

    const mesh = new Mesh({ geometry, material });
    const camera = new Camera('perspective');
    frameObject(mesh, camera);

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