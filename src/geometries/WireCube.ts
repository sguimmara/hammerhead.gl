import Mesh from './Mesh';

const A = 0;
const B = 1;
const C = 2;
const D = 3;

const E = 4;
const F = 5;
const G = 6;
const H = 7;

// Note: even though we don't need a 32 bit buffer,
// vertex pulling requires access to buffers as uniforms
// and not attributes. And WebGPU uniforms do not support u16 data type.
const indices = new Uint32Array([
    A, B, B, C, C, D, D, A, // bottom side
    E, H, H, G, G, F, F, E, // top side
    D, A, A, E, E, H, H, D, // left side
    C, B, B, F, F, G, G, C, // right side
    D, C, C, G, G, H, H, D, // back side
    A, B, B, F, F, E, E, A, // front side
]);

const half = 0.5;
const xmin = -half;
const xmax = +half;
const ymin = -half;
const ymax = +half;
const zmin = -half;
const zmax = +half;
//        +z
// D ---- C
// |      |
// |bottom|
// A ---- B +x

// H ---- G
// |      |
// | top  |
// E ---- F

// f = front, b = back
const vertices = new Float32Array([
    xmin, ymin, zmin, // A
    xmax, ymin, zmin, // B
    xmax, ymin, zmax, // C
    xmin, ymin, zmax, // D

    xmin, ymax, zmin, // E
    xmax, ymax, zmin, // F
    xmax, ymax, zmax, // G
    xmin, ymax, zmax, // H
]);

/**
 * A wireframe cube.
 */
export default class WireCube extends Mesh {
    constructor() {
        super({ topology: 'line-list' });
        this.setAttribute('position', vertices);
        this.setIndices(indices);
    }
}
