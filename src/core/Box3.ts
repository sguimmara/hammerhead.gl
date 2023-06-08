import { Vec3, vec3 } from "wgpu-matrix";

export default class Box3 {
    min: Vec3;
    max: Vec3;
    center: Vec3;

    constructor(options: {
        min?: Vec3,
        max?: Vec3
    }) {
        this.min = options.min;
        this.max = options.max;
        if (this.max && this.min) {
            this.center = vec3.lerp(this.min, this.max, 0.5);
        }
    }

    /**
     * Calls the callback function for each of the 8 corners of this box.
     * @param callback The callback to apply.
     */
    forEachCorner(callback: (corner: Vec3) => void) {
        const [xMin, yMin, zMin] = this.min;
        const [xMax, yMax, zMax] = this.max;

        callback([xMax, yMax, zMax]);
        callback([xMax, yMax, zMin]);
        callback([xMax, yMin, zMin]);
        callback([xMin, yMin, zMin]);
        callback([xMin, yMax, zMax]);
        callback([xMin, yMin, zMax]);
        callback([xMax, yMin, zMax]);
        callback([xMin, yMax, zMin]);
    }

    static fromPoints(points: ArrayLike<number>) {
        let minX = +Infinity;
        let minY = +Infinity;
        let minZ = +Infinity;

        let maxX = -Infinity;
        let maxY = -Infinity;
        let maxZ = -Infinity;

        const length = points.length;
        for (let i = 0; i < length; i += 3) {
            const x = points[i + 0];
            const y = points[i + 1];
            const z = points[i + 2];

            minX = Math.min(x, minX);
            minY = Math.min(y, minY);
            minZ = Math.min(z, minZ);

            maxX = Math.max(x, maxX);
            maxY = Math.max(y, maxY);
            maxZ = Math.max(z, maxZ);
        }

        return new Box3({
            min: vec3.create(minX, minY, minZ),
            max: vec3.create(maxX, maxY, maxZ),
        });
    }
}