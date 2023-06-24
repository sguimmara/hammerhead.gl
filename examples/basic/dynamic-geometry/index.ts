import chroma from 'chroma-js';
import { Context } from 'hammerhead.gl/core';
import { BoundsHelper } from 'hammerhead.gl/helpers';
import { BasicMaterial } from 'hammerhead.gl/materials';
import { Camera, MeshObject, Object3D } from 'hammerhead.gl/scene';

import { loadPLYModel } from '../../lib';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const solid = new BasicMaterial({
        cullingMode: 'back',
    }).withDiffuseColor(chroma('cyan'));

    const wireframe = new BasicMaterial().withDiffuseColor(chroma('black'));

    const mesh = await loadPLYModel('/files/hammerhead.ply');
    const solidMesh = new MeshObject({ mesh, material: solid});
    const wireframeMesh = new MeshObject({ mesh, material: wireframe});

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

    const vertices = mesh.getAttribute('position');

    const originalVertices = new Float32Array(vertices.value);

    const box = mesh.getBounds();
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
        solidMesh.mesh.setAttribute('position', array);
        wireframeMesh.mesh.setAttribute('position', array);
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
