import Mesh from './Mesh';

/**
 * A screen-space quad that fits the screen.
 */
export default class ScreenQuad extends Mesh {
    constructor() {
        super();
        const x = 1;
        const y = 1;
        const cx = 0;
        const cy = 0;
        const z = 0.0;

        this.setAttribute('position', new Float32Array([
            -1.0 * x + cx, -1.0 * y + cy, z, // bottom left
            -1.0 * x + cx,  1.0 * y + cy, z, // top left
             1.0 * x + cx,  1.0 * y + cy, z, // top right
             1.0 * x + cx, -1.0 * y + cy, z, // bottom right
        ]));

        this.setIndices(new Uint16Array([
            0, 1, 2,
            0, 2, 3
        ]));

        this.setAttribute('texcoord', new Float32Array([
            0.0, 1.0, // bottom left
            0.0, 0.0, // top left
            1.0, 0.0, // top right
            1.0, 1.0, // bottom right
        ]));
    }
}
