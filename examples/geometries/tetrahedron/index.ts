import chroma from "chroma-js";
import { Context, MathUtils } from "hammerhead.gl/core";
import { Tetrahedron } from "hammerhead.gl/geometries";
import { BasicMaterial, RenderingMode } from "hammerhead.gl/materials";
import { Camera, MeshObject } from "hammerhead.gl/scene";

import { frameObject } from "../../lib";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const material = new BasicMaterial({
        renderingMode: RenderingMode.Triangles,
    });

    const mesh = new MeshObject({
        material,
        mesh: new Tetrahedron(),
    });

    const colors = [
        chroma("red"),
        chroma("green"),
        chroma("blue"),
        chroma("yellow")
    ];

    mesh.mesh.setAttribute('color', new Float32Array(colors.flatMap(c => c.gl())));

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
