import chroma from 'chroma-js';
import { Context } from 'hammerhead.gl/core';
import { Quad, ScreenQuad, WireQuad } from 'hammerhead.gl/geometries';
import {
    BasicMaterial,
    Material,
} from 'hammerhead.gl/materials';
import { Camera, Node } from 'hammerhead.gl/scene';

import { load8bitImage } from '../../lib';
import { BlendFactor, BlendOp } from 'hammerhead.gl/materials/Material';
import Inspector from '../../Inspector';

export async function run(context: Context, inspector: Inspector) {
    const checkerboard = await load8bitImage('/checkerboard.jpg');
    const explosion = await load8bitImage('/explosion.png');

    const renderer = context.renderer;
    renderer.clearColor = chroma('cyan');

    const background = new Node()
       .setMaterial(new BasicMaterial()
            .withColorTexture(checkerboard)
            .setDiffuseColor(chroma([255, 255, 255, 0.4], 'rgb')))
        .setMesh(new ScreenQuad());

    background.transform.setPosition(0, 0, -0.2);

    const tile = new Node()
        .setMaterial(new BasicMaterial().withColorTexture(explosion))
        .setMesh(new Quad());

    const wireframe = new Node()
        .setMaterial(new BasicMaterial().setDiffuseColor(chroma('yellow')))
        .setMesh(new WireQuad());

    tile.add(wireframe);

    const root = new Node();

    root.add(background);
    root.add(tile);

    const camera = new Camera('orthographic');

    function render() {
        renderer.render(root, camera);
    }

    context.on('resized', () => render());

    render();

    function createFolder(material: Material) {
        const colorFolder = inspector.pane.addFolder({
            title: 'color blending',
            expanded: true,
        });

        const alphaFolder = inspector.pane.addFolder({
            title: 'alpha blending',
            expanded: true,
        });

        colorFolder.addInput(material.colorBlending, 'op', {
            options: BlendOp,
        });
        colorFolder.addInput(material.colorBlending, 'srcFactor', {
            options: BlendFactor,
        });
        colorFolder.addInput(material.colorBlending, 'dstFactor', {
            options: BlendFactor,
        });

        alphaFolder.addInput(material.alphaBlending, 'op', {
            options: BlendOp,
        });
        alphaFolder.addInput(material.alphaBlending, 'srcFactor', {
            options: BlendFactor,
        });
        alphaFolder.addInput(material.alphaBlending, 'dstFactor', {
            options: BlendFactor,
        });
    }

    createFolder(tile.material);

    inspector.pane.on('change', () => {
        tile.material.incrementVersion();
        render();
    });
}
