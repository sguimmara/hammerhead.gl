import chroma from 'chroma-js';

import BufferGeometry from './BufferGeometry';

/**
 * A wireframe quad.
 */
export default class WireQuad extends BufferGeometry {
    constructor() {
        super({ vertexCount: 4, indexCount: 8 });

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

        const uv = [
            0, 1, // A
            1, 1, // B
            1, 0, // C
            0, 0, // D
        ];

        const A = 0, B = 1, C = 2, D = 3;
        const indices = [
            A, B, B, C, C, D, D, A,
        ];

        this.setPositions(positions);
        this.setColors(chroma('white'));
        this.setTexCoords(uv);
        this.setIndices(indices);
        this.getLocalBounds();
    }
}
