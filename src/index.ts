import Context from './Context';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

try {
    const context = Context.create(canvas);
} catch (err) {
    console.error(err);
}