import chroma from "chroma-js";
import { Context, MathUtils } from "hammerhead.gl/core";
import { BasicMaterial, RenderingMode } from "hammerhead.gl/materials";
import { Camera, Mesh } from "hammerhead.gl/objects";

import { frameObject, loadPLYModel } from "../../lib";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const geometry = await loadPLYModel("/files/hammerhead.ply");

    const material = new BasicMaterial({
        renderingMode: RenderingMode.Points,
    }).withDiffuseColor(chroma("cyan"));

    const mesh = new Mesh({ geometry, material });
    const camera = new Camera("perspective");
    frameObject(mesh, camera);

    function render() {
        renderer.render(mesh, camera);
    }

    let now = performance.now();

    function renderLoop() {
        render();
        const current = performance.now();
        const dt = (current - now) / 1000;
        const degrees = 40 * dt;
        now = current;
        mesh.transform.rotateY(MathUtils.deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on("resized", render);
}

main();
