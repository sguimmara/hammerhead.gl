import chroma from "chroma-js";
import { Context, MathUtils } from "hammerhead.gl/core";
import { Tetrahedron } from "hammerhead.gl/geometries";
import { BasicMaterial, RenderingMode } from "hammerhead.gl/materials";
import { Camera, Mesh } from "hammerhead.gl/objects";

import { frameObject } from "../../lib";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const material = new BasicMaterial({
        renderingMode: RenderingMode.Triangles,
    });

    const mesh = new Mesh({
        material,
        geometry: new Tetrahedron(),
    });

    mesh.geometry.setColors([
        chroma("red"),
        chroma("green"),
        chroma("blue"),
        chroma("yellow"),
    ]);

    const camera = new Camera("perspective");
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
        mesh.transform.rotateY(MathUtils.deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on("resized", render);
}

main();
