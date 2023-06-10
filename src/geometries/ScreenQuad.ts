import chroma from 'chroma-js';

import BufferGeometry from './BufferGeometry';

/**
 * A screen-space quad that fits the screen.
 */
export default class ScreenQuad extends BufferGeometry {
    constructor() {
        super({
            vertexCount: 4,
            indexCount: 6
        });

        const x = 1;
        const y = 1;
        const cx = 0;
        const cy = 0;
        const z = 0.0;

        this.setPositions([
            -1.0 * x + cx, -1.0 * y + cy, z, // bottom left
            -1.0 * x + cx,  1.0 * y + cy, z, // top left
             1.0 * x + cx,  1.0 * y + cy, z, // top right
             1.0 * x + cx, -1.0 * y + cy, z, // bottom right
        ]);

        this.setIndices([
            0, 1, 2,
            0, 2, 3
        ]);

        this.setTexCoords([
            0.0, 1.0, // bottom left
            0.0, 0.0, // top left
            1.0, 0.0, // top right
            1.0, 1.0, // bottom right
        ]);

        this.setColors(chroma('white'));
    }
}
