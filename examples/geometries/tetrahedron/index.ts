import chroma from "chroma-js";
import { Context, MathUtils } from "hammerhead.gl/core";
import { Tetrahedron } from "hammerhead.gl/geometries";
import { BasicMaterial, LineMaterial } from "hammerhead.gl/materials";
import { Camera, MeshObject } from "hammerhead.gl/scene";

import { frameObject } from "../../lib";
import { Primitive } from "hammerhead.gl/materials/Material";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('pink');

    const material = new BasicMaterial();
    const tetrahedron = new Tetrahedron();

    const mesh = new MeshObject({
        material,
        mesh: tetrahedron,
    });

    const wireMesh = new MeshObject({
        material: new LineMaterial().setColor(chroma('black')),
        mesh: tetrahedron,
    })

    const colors = [
        chroma("red"),
        chroma("green"),
        chroma("blue"),
        chroma("yellow")
    ];

    mesh.add(wireMesh);

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
