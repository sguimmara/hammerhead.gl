import { Context, MathUtils } from "hammerhead.gl/core";
import { Camera } from "hammerhead.gl/scene";
import GLTFLoader from "./gltf";
import { frameBounds } from "../../lib";
import Inspector from "../../Inspector";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const uri = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf';
    const baseUri = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/';
    const loader = new GLTFLoader();
    const gltf = await loader.loadGltfScene(uri, baseUri);
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const scene = gltf[0];

    console.log(gltf);

    const camera = new Camera("perspective");
    frameBounds(scene.getWorldBounds(), camera);

    function render() {
        renderer.render(scene, camera);
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
        scene.transform.rotateY(MathUtils.deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on("resized", render);

    const inspector = new Inspector(context);
}

main();
