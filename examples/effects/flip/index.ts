import { Context } from "hammerhead.gl/core";
import GeometryBuilder from "hammerhead.gl/geometries/GeometryBuilder";
import { BasicMaterial } from "hammerhead.gl/materials";
import { Flip } from "hammerhead.gl/materials/postprocessing";
import { Camera, Mesh } from "hammerhead.gl/objects";

import { bindToggle, load8bitImage } from "../../lib";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage("/webgpu.png");

    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const flip = new Flip();

    renderer.setRenderStages([flip]);

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Mesh({
        material,
        geometry: GeometryBuilder.screenQuad(),
    });

    const camera = new Camera("orthographic");

    function render() {
        renderer.render(mesh, camera);
    }

    render();

    context.on("resized", render);

    bindToggle("toggle-flip-x", (v: boolean) => {
        flip.withFlipX(v);
        render();
    });

    bindToggle("toggle-flip-y", (v: boolean) => {
        flip.withFlipY(v);
        render();
    });
}

main();
