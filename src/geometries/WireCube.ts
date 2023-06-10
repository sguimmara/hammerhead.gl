import BufferGeometry from './BufferGeometry';
import chroma from 'chroma-js';

export default class WireCube extends BufferGeometry {
    constructor() {
        super({ vertexCount: 8, indexCount: 48 });

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
        const vertices = [
            xmin, ymin, zmin, // A
            xmax, ymin, zmin, // B
            xmax, ymin, zmax, // C
            xmin, ymin, zmax, // D

            xmin, ymax, zmin, // E
            xmax, ymax, zmin, // F
            xmax, ymax, zmax, // G
            xmin, ymax, zmax, // H
        ];

        const A = 0;
        const B = 1;
        const C = 2;
        const D = 3;

        const E = 4;
        const F = 5;
        const G = 6;
        const H = 7;

        const indices = [
            A, B, B, C, C, D, D, A, // bottom side
            E, H, H, G, G, F, F, E, // top side
            D, A, A, E, E, H, H, D, // left side
            C, B, B, F, F, G, G, C, // right side
            D, C, C, G, G, H, H, D, // back side
            A, B, B, F, F, E, E, A, // front side
        ];

        this.setPositions(vertices);
        this.setIndices(indices);
        this.setTexCoords();
        this.setColors(chroma('white'));
    }
}