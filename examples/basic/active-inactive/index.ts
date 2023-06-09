import { Context } from "hammerhead.gl/core";
import { ScreenQuad } from "hammerhead.gl/geometries";
import { BasicMaterial } from "hammerhead.gl/materials";
import { Camera, MeshObject } from "hammerhead.gl/scene";

import { load8bitImage } from "../../lib";
import { Pane } from "tweakpane";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage("/webgpu.png");

    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new MeshObject({
        material,
        mesh: new ScreenQuad(),
    });

    const camera = new Camera("orthographic");

    function render() {
        renderer.render(mesh, camera);
    }

    render();

    context.on("resized", render);

    const pane = new Pane();

    const params = {
        mesh: mesh.active,
        material: material.active,
    };

    pane.addInput(params, 'mesh')
        .on('change', ev => {
            mesh.active = ev.value;
            render();
        });
    pane.addInput(params, 'material')
        .on('change', ev => {
            material.active = ev.value;
            render()
        });
}

main();
