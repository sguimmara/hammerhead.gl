import chroma from "chroma-js";
import { Context } from "hammerhead.gl/core";
import { ScreenQuad } from "hammerhead.gl/geometries";
import { BasicMaterial } from "hammerhead.gl/materials";
import { Camera, MeshObject } from "hammerhead.gl/scene";

import { load8bitImage } from "../../lib";
import { Float32 } from "apache-arrow";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage("/webgpu.png");

    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const material = new BasicMaterial().withColorTexture(logo);

    const quad = new MeshObject({
        material,
        mesh: new ScreenQuad(),
    });

    const colors = [
        chroma("red"),
        chroma("green"),
        chroma("blue"),
        chroma("cyan")
    ];
    const colorBuffer = new Float32Array(colors.flatMap(c => c.gl()));
    quad.mesh.setAttribute('color', colorBuffer);

    const camera = new Camera("orthographic");

    function render() {
        renderer.render(quad, camera);
    }

    render();

    context.on("resized", render);
}

main();
