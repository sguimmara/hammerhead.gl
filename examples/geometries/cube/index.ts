import chroma from "chroma-js";
import { Context, MathUtils } from "hammerhead.gl/core";
import { Cube, WireCube } from "hammerhead.gl/geometries";
import { BasicMaterial, RenderingMode } from "hammerhead.gl/materials";
import { Camera, Mesh } from "hammerhead.gl/objects";

import { frameObject, load8bitImage } from "../../lib";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage("/webgpu.png");
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma("gray");

    const cube = new Mesh({
        material: new BasicMaterial()
            .withDiffuseColor(chroma("yellow"))
            .withColorTexture(logo),
        geometry: new Cube(),
    });

    const wirecube = new Mesh({
        material: new BasicMaterial({
            renderingMode: RenderingMode.LineList,
        }).withDiffuseColor(chroma("black")),
        geometry: new WireCube(),
    });

    cube.add(wirecube);
    const camera = new Camera("perspective");
    frameObject(cube, camera);

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
        cube.transform.rotateY(MathUtils.deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on("resized", render);
}

main();
