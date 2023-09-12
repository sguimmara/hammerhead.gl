import chroma from 'chroma-js';
import { Context, MathUtils } from 'hammerhead.gl/core';
import { Tetrahedron } from 'hammerhead.gl/geometries';
import { BasicMaterial, LineMaterial } from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';

import { frameObject } from '../../lib';

export function run(context: Context) {
    const renderer = context.renderer;
    renderer.clearColor = chroma('pink');

    const material = new BasicMaterial();
    const tetrahedron = new Tetrahedron();

    const solid: Node = new Node()
        .setMaterial(material)
        .setMesh(tetrahedron);

    const wireframe = new Node()
        .setMaterial(new LineMaterial().setColor(chroma('black')))
        .setMesh(tetrahedron);

    const colors = [
        chroma('red'),
        chroma('green'),
        chroma('blue'),
        chroma('yellow')
    ];

    solid.add(wireframe);

    solid.mesh.setAttribute('color', new Float32Array(colors.flatMap(c => c.gl())));

    const camera = new Camera('perspective');
    frameObject(solid, camera);

    function render() {
        renderer.render(solid, camera);
    }

    let now = performance.now();

    function renderLoop() {
        if (renderer.destroyed) {
            return;
        }
        render();
        const current = performance.now();
        const dt = (current - now) / 1000;
        const degrees = 40 * dt;
        now = current;
        solid.transform.rotateY(MathUtils.deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}
