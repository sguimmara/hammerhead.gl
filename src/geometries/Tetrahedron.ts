import { MathUtils } from '@/core';
import Mesh from './Mesh';

/**
 * A tetrahedron.
 */
export default class Tetrahedron extends Mesh {
    constructor() {
        super();

        const b0x = Math.cos(MathUtils.deg2rad(-120));
        const b0z = Math.sin(MathUtils.deg2rad(-120));

        const b1x = Math.cos(MathUtils.deg2rad(120));
        const b1z = Math.sin(MathUtils.deg2rad(120));

        this.setAttribute('position', new Float32Array([
            b0z, 0, b0x, // Base 0 (b0)
            b1z, 0, b1x, // Base 1 (b1)
            0, 0, 1, // Base 2 (b2)
            0, 1.5, 0  // Summit (s)
        ]));

        const b0 = 0;
        const b1 = 1;
        const b2 = 2;
        const s = 3;

        this.setIndices(new Uint32Array([
            b1, b0, b2,
            b1, b2, s,
            b2, b0, s,
            b0, b1, s,
        ]));

        this.setAttribute('texcoord', new Float32Array([
            0.0, 1.0, // bottom left
            0.0, 0.0, // top left
            1.0, 0.0, // top right
            1.0, 1.0, // bottom right
        ]));
    }
}
