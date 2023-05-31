import Context from './src/Context';
import Mesh from './src/objects/Mesh';
import chroma from 'chroma-js';
import GeometryBuilder from './src/geometries/GeometryBuilder';
import Vec2 from './src/Vec2';
import Texture from './src/textures/Texture';
import BasicMaterial from './src/materials/BasicMaterial';
import InvertColors from './src/materials/postprocessing/InvertColors';
import Colorimetry from './src/materials/postprocessing/Colorimetry';
import ScaleImage from './src/materials/postprocessing/ScaleImage';
import SinWave from './src/materials/postprocessing/SinWave';
import Material from './src/materials/Material';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

const url = 'titmouche.jpg';

function load8bitImage(img: HTMLImageElement, url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onerror = reject;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('could not acquire 2d context');
            }
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const texture = new Texture({
                width: img.width,
                height: img.height,
                data: data.data
            });
            resolve(texture);
        }
    });
}

async function main() {
    const img = new Image();

    const mouche = await load8bitImage(img, 'titmouche.jpg');
    const logo = await load8bitImage(img, 'webgpu.png');

    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('pink');
    renderer.setRenderStages([
        new SinWave({ speed: 4 }),
        // new Colorimetry({ saturation: 0.5 }),
    ]);

    const materials = [
        new BasicMaterial().withColorTexture(mouche).withDiffuseColor(chroma('blue')),
        new BasicMaterial().withColorTexture(logo).withDiffuseColor(chroma('red')),
        new BasicMaterial().withColorTexture(mouche).withDiffuseColor(chroma('pink')),
        new BasicMaterial().withColorTexture(logo).withDiffuseColor(chroma('green')),
        new BasicMaterial().withColorTexture(mouche).withDiffuseColor(chroma('cyan')),
        new BasicMaterial().withColorTexture(logo).withDiffuseColor(chroma('white')),
        new BasicMaterial().withColorTexture(mouche).withDiffuseColor(chroma('black')),
        new BasicMaterial().withColorTexture(logo).withDiffuseColor(chroma('purple')),
    ];

    const meshes : Mesh[] = [];

    const fullScreen = new Mesh({
        material: new BasicMaterial().withColorTexture(mouche).withDiffuseColor(chroma('orange')),
        geometry: GeometryBuilder.screenQuad(),
    });

    meshes.push(fullScreen);

    // for (let i = 0; i < 1000; i++) {
    //     const center = new Vec2((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
    //     const size = new Vec2(Math.random() * 0.3, Math.random() * 0.3);
    //     const material = materials[Math.round(Math.random() * (materials.length - 1))];
    //     const mesh = new Mesh({
    //         material: new BasicMaterial().withColorTexture(mouche),
    //         geometry: GeometryBuilder.quad(center, size),
    //     });
    //     meshes.push(mesh);
    // }

    function render() {
        renderer.render(meshes);
    }

    function renderLoop() {
        render();
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();