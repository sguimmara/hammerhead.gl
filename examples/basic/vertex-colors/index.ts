import chroma from "chroma-js";
import { Context } from "hammerhead.gl/core";
import GeometryBuilder from "hammerhead.gl/geometries/GeometryBuilder";
import { BasicMaterial } from "hammerhead.gl/materials";
import { Camera, Mesh } from "hammerhead.gl/objects";

import { load8bitImage } from "../../lib";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage("/webgpu.png");

    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Mesh({
        material,
        geometry: GeometryBuilder.screenQuad(),
    });

    mesh.geometry.setColors([
        chroma("red"),
        chroma("green"),
        chroma("blue"),
        chroma("cyan"),
    ]);

    const camera = new Camera("orthographic");

    function render() {
        renderer.render(mesh, camera);
    }

    render();

    context.on("resized", render);
}

main();
