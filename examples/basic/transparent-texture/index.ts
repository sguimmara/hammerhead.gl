import chroma from "chroma-js";
import { Context } from "hammerhead.gl/core";
import GeometryBuilder from "hammerhead.gl/geometries/GeometryBuilder";
import { BasicMaterial } from "hammerhead.gl/materials";
import { Camera, Mesh } from "hammerhead.gl/objects";

import { load8bitImage } from "../../lib";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage("/webgpu-transparent.png");

    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma("pink");

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Mesh({
        material,
        geometry: GeometryBuilder.screenQuad(),
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
