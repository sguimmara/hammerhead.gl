import { Context, MathUtils } from 'hammerhead.gl/core';
import { Camera, Node } from 'hammerhead.gl/scene';
import GLTFLoader from './gltf';
import { frameBounds } from '../../lib';
import { BoundsHelper } from 'hammerhead.gl/helpers';

export async function run(context: Context) {
    const model = 'DamagedHelmet';
    const uri = `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/${model}/glTF/${model}.gltf`;
    const baseUri = `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/${model}/glTF/`;
    const loader = new GLTFLoader();
    const gltf = await loader.loadGltfScene(uri, baseUri);
    const renderer = context.renderer;

    const scene = gltf[0];

    const root = new Node();
    const boundsHelper = new BoundsHelper({ source: scene });
    root.add(scene);
    root.add(boundsHelper);

    const camera = new Camera('perspective');
    frameBounds(root.getWorldBounds(), camera);

    function render() {
        renderer.render(root, camera);
    }

    let now = performance.now();

    function renderLoop() {
        if (renderer.destroyed) {
            return;
        }
        boundsHelper.update();
        render();
        const current = performance.now();
        const dt = (current - now) / 1000;
        const degrees = 40 * dt;
        now = current;
        scene.transform.rotateY(MathUtils.deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}
