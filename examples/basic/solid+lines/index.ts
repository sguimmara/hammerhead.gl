import Context from "../../../src/core/Context";
import { deg2rad } from "../../../src/core/MathUtils";
import Camera from "../../../src/objects/Camera";
import BasicMaterial from "../../../src/materials/BasicMaterial";
import chroma from "chroma-js";
import { frameObject, loadPLYModel } from "../../lib";
import Mesh from "../../../src/objects/Mesh";
import { CullingMode, FrontFace, RenderingMode } from "../../../src/materials/Material";

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const geometry = await loadPLYModel('/files/hammerhead.ply');
    const solid = new BasicMaterial({
        renderingMode: RenderingMode.Triangles,
        frontFace: FrontFace.CW,
        cullingMode: CullingMode.Front,
    }).withDiffuseColor(chroma('cyan'));
    const wireframe = new BasicMaterial({ renderingMode: RenderingMode.TriangleLines }).withDiffuseColor(chroma('black'));

    const solidMesh = new Mesh({ geometry, material: solid});
    const wireframeMesh = new Mesh({ geometry, material: wireframe});
    solidMesh.add(wireframeMesh);
    const camera = new Camera('perspective');
    frameObject(solidMesh, camera);

    function render() {
        renderer.render(solidMesh, camera);
    }

    let now = performance.now();

    function renderLoop() {
        render();
        const current = performance.now();
        const dt = (current - now) / 1000;
        const degrees = 40 * dt;
        now = current;
        solidMesh.transform.rotateY(deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();