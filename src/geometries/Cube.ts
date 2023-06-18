import Mesh from './Mesh';

/**
 * A solid cube.
 */
export default class Cube extends Mesh {
    constructor() {
        super();

        const half = 0.5;
        const xmin = -half;
        const xmax = +half;
        const ymin = -half;
        const ymax = +half;
        const zmin = -half;
        const zmax = +half;

        // D ---- C
        // |      |
        // |      |
        // A ---- B

        // f = front, b = back
        const vertices = [
            xmin, ymin, zmin, // Af
            xmax, ymin, zmin, // Bf
            xmax, ymax, zmin, // Cf
            xmin, ymax, zmin, // Df

            xmin, ymin, zmax, // Ab
            xmax, ymin, zmax, // Bb
            xmax, ymax, zmax, // Cb
            xmin, ymax, zmax, // Db
        ];

        const Af = 0;
        const Bf = 1;
        const Cf = 2;
        const Df = 3;

        const Ab = Af + 4;
        const Bb = Bf + 4;
        const Cb = Cf + 4;
        const Db = Df + 4;

        const indices = [
            Af, Bf, Cf, Af, Cf, Df, // front side
            Ab, Cb, Bb, Ab, Db, Cb, // back side
            Df, Ab, Af, Df, Db, Ab, // left side
            Af, Bb, Bf, Af, Ab, Bb, // bottom side
            Bf, Cb, Cf, Bf, Bb, Cb, // right side
            Cf, Db, Df, Cf, Cb, Db, // top side
        ];

        this.setAttribute('position', new Float32Array(vertices));
        this.setIndices(new Uint16Array(indices));
    }
}
