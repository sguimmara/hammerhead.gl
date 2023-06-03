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

    const geometry = GeometryBuilder.pyramid();
    geometry.setColors([
        chroma('red'),
        chroma('green'),
        chroma('blue'),
        chroma('yellow'),
    ]);

    function makePyramid(x: number, y: number, z: number) {
        const pyramid = new Mesh({
            material,
            geometry,
        });

        const scale = 0.1;
        pyramid.transform.setScale(scale, scale, scale);
        pyramid.transform.setPosition(x, y, z);

        return pyramid;
    }

    const root = new Object3D();

    for (let i = 0; i < 10000; i++) {
        function rand() {
            return (Math.random() - 0.5) * 10;
        }
        root.add(makePyramid(rand(), rand(), rand()));
    }

    const camera = new Camera('perspective');
    camera.setPosition(0, 0, 40);
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
        root.transform.rotateX(deg2rad(degrees));
        render();
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();