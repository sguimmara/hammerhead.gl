import chroma from "chroma-js";
import { Context } from "hammerhead.gl/core";
import { ScreenQuad } from "hammerhead.gl/geometries";
import { BasicMaterial } from "hammerhead.gl/materials";
import { Camera, MeshObject } from "hammerhead.gl/scene";

import { load8bitImage } from "../../lib";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage("/webgpu-transparent.png");

    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma("pink");

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new MeshObject({
        material,
        mesh: new ScreenQuad(),
    });

    const camera = new Camera("orthographic");

    const color1 = chroma("green");
    const color2 = chroma("red");

    function renderLoop() {
        const t = (Math.sin(performance.now() / 250) + 1) / 2;
        renderer.clearColor = chroma.interpolate(color1, color2, t);
        renderer.render(mesh, camera);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

main();
