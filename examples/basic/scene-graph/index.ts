import Context from '../../../src/core/Context';
import Mesh from '../../../src/objects/Mesh';
import GeometryBuilder from '../../../src/geometries/GeometryBuilder';
import BasicMaterial from '../../../src/materials/BasicMaterial';
import { load8bitImage } from '../../lib';
import chroma from 'chroma-js';
import { mat4, vec3 } from 'wgpu-matrix';
import { deg2rad } from '../../../src/core/MathUtils';
import Camera from '../../../src/objects/Camera';
import Object3D from '../../../src/objects/Object3D';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const material = new BasicMaterial();

    function makePyramid(x: number, y: number, z: number) {
        const pyramid = new Mesh({
            material,
            geometry: GeometryBuilder.pyramid(),
        });

        pyramid.geometry.setColors([
            chroma('red'),
            chroma('green'),
            chroma('blue'),
            chroma('yellow'),
        ]);

        pyramid.transform.setPosition(x, y, z);

        return pyramid;
    }

    const root = new Object3D();

    root.add(makePyramid(0, 0, 0));
    root.add(makePyramid(2, 0, 0));
    root.add(makePyramid(0, 0, 2));
    root.add(makePyramid(0, 2, 0));

    const camera = new Camera('perspective');
    camera.setPosition(0, 7, 10);
    camera.lookAt(0, 0, 0);

    function render() {
        renderer.render(root, camera);
    }

    let now = performance.now();

    root.transform.setScale(1.2, 1.2, 1.2);

    function renderLoop() {
        const current = performance.now();
        const dt = (current - now) / 1000;
        const degrees = 40 * dt;
        now = current;
        root.transform.rotateY(deg2rad(degrees));
        render();
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();