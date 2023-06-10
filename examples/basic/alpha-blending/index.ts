import chroma from 'chroma-js';
import Context from 'hammerhead.gl/core/Context';
import GeometryBuilder from 'hammerhead.gl/geometries/GeometryBuilder';
import Quad from 'hammerhead.gl/geometries/Quad';
import WireQuad from 'hammerhead.gl/geometries/WireQuad';
import BasicMaterial from 'hammerhead.gl/materials/BasicMaterial';
import Material, { RenderingMode } from 'hammerhead.gl/materials/Material';
import Camera from 'hammerhead.gl/objects/Camera';
import Mesh from 'hammerhead.gl/objects/Mesh';
import Object3D from 'hammerhead.gl/objects/Object3D';

import { load8bitImage } from '../../lib';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage('/webgpu-transparent.png');
    const explosion = await load8bitImage('/explosion.png');

    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const material = new BasicMaterial().withColorTexture(logo);

    const background = new Mesh({
        material,
        geometry: GeometryBuilder.screenQuad(),
    });

    background.transform.setPosition(0, 0, -0.2);

    function makeTile(material: Material, x: number, y: number, z: number) {
        const tile = new Mesh({
            material,
            geometry: new Quad()
        });

        const wireframe = new Mesh({
            material: new BasicMaterial({ renderingMode: RenderingMode.LineList }).withDiffuseColor(chroma('yellow')),
            geometry: new WireQuad(),
        });

        tile.add(wireframe);

        tile.transform.setScale(0.5, 0.5, 0.5);
        tile.transform.setPosition(x, y, z);

        return tile;
    }

    const normal = makeTile(new BasicMaterial().withColorTexture(explosion), -0.7, 0.7, -0.1);
    const blend = makeTile(new BasicMaterial().withColorTexture(explosion), 0, 0.7, -0.1);
    const add = makeTile(new BasicMaterial().withColorTexture(explosion), +0.7, 0.7, -0.1);

    const root = new Object3D();

    root.add(background);
    root.add(normal);
    root.add(blend);
    root.add(add);

    const camera = new Camera('orthographic');

    function renderLoop() {
        renderer.render(root, camera);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

main();