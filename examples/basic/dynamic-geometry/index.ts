import Context from "../../../src/core/Context";
import { deg2rad } from "../../../src/core/MathUtils";
import Camera from "../../../src/objects/Camera";
import BasicMaterial from "../../../src/materials/BasicMaterial";
import chroma from "chroma-js";
import { frameObject, loadPLYModel } from "../../lib";
import Mesh from "../../../src/objects/Mesh";
import { CullingMode, FrontFace, RenderingMode } from "../../../src/materials/Material";
import { VertexBufferSlot } from "../../../src/core/constants";
import BoundsHelper from "../../../src/helpers/BoundsHelper";
import Object3D from "../../../src/objects/Object3D";

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const solid = new BasicMaterial({
        renderingMode: RenderingMode.Triangles,
        frontFace: FrontFace.CW,
        cullingMode: CullingMode.Front,
    }).withDiffuseColor(chroma('cyan'));

    const wireframe = new BasicMaterial({ renderingMode: RenderingMode.TriangleLines }).withDiffuseColor(chroma('black'));

    const geometry = await loadPLYModel('/files/hammerhead.ply');
    const solidMesh = new Mesh({ geometry, material: solid});
    const wireframeMesh = new Mesh({ geometry, material: wireframe});

    solidMesh.add(wireframeMesh);

    const camera = new Camera('perspective');
    camera.transform.setPosition(0, 0, 300);

    const helper = new BoundsHelper({ source: solidMesh });

    const root = new Object3D();
    root.add(helper);
    root.add(solidMesh);

    function render() {
        renderer.render(root, camera);
    }

    const vertices = geometry.getVertexBuffer(VertexBufferSlot.Position);

    const originalVertices = new Float32Array(vertices.value);

    const box = geometry.getLocalBounds();
    const left = box.min[0];
    const right = box.max[0];
    const width = Math.abs(right - left) * 0.1;

    const speed = 0.005;
    function updateVertices(t: number) {
        const array = vertices.value;
        for (let i = 0; i < array.length; i += 3) {
            const x = array[i + 0];
            const distanceToLeft = Math.abs(x - left) / width;
            const sin = Math.sin((t * speed) - distanceToLeft);
            const distance = sin * 20;
            array[i + 1] = originalVertices[i + 1] + distance;
        }
        solidMesh.geometry.setPositions(array);
        wireframeMesh.geometry.setPositions(array);
    }

    function renderLoop() {
        const current = performance.now();
        updateVertices(current);
        requestAnimationFrame(renderLoop);
        helper.update();
        render();
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();