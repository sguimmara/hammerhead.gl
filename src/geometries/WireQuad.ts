import Mesh from './Mesh';

const A = 0, B = 1, C = 2, D = 3;
const indexBuffer = new Uint32Array([
    A, B, B, C, C, D, D, A,
]);

const uv = [
    0, 1, // A
    1, 1, // B
    1, 0, // C
    0, 0, // D
];

const x = 0.5;
const y = 0.5;

// D --- C
// |     |
// A --- B

const positions = [
    -x, -y, 0, // A
    +x, -y, 0, // B
    +x, +y, 0, // C
    -x, +y, 0, // D
];

/**
 * A wireframe quad.
 */
export default class WireQuad extends Mesh {
    constructor() {
        super({ topology: 'line-list'});

        this.setAttribute('position', new Float32Array(positions));
        this.setIndices(indexBuffer);
        this.setAttribute('texcoord', new Float32Array(uv));
    }
}
