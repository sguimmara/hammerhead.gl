import { Vec3, vec3 } from 'wgpu-matrix';
import { Clone } from '@core';

export default class Box3 implements Clone {
    min: Vec3;
    max: Vec3;
    center: Vec3;
    size: Vec3;

    constructor(options: {
        min?: Vec3,
        max?: Vec3
    }) {
        this.min = options.min;
        this.max = options.max;
        if (this.max && this.min) {
            this.updateCenterAndSize();
        }
    }

    private updateCenterAndSize() {
        this.center = vec3.lerp(this.min, this.max, 0.5);
        this.size = [
            Math.abs(this.max[0] - this.min[0]),
            Math.abs(this.max[1] - this.min[1]),
            Math.abs(this.max[2] - this.min[2]),
        ];
    }

    clone(): Box3 {
        return new Box3({ min: this.min, max: this.max });
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

    static union(boxes: Array<Box3>) {
        if (boxes.length === 0) {
            return null;
        }

        let result : Box3 = null;
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i]) {
                if (!result) {
                    result = boxes[i];
                } else {
                    result.expand(boxes[i]);
                }
            }
        }

        return result;
    }

    /**
     * **Mutates** this box to contain the other box.
     * @param other The box to expand.
     */
    expand(other: Box3) {
        const xMin = Math.min(this.min[0], other.min[0]);
        const yMin = Math.min(this.min[1], other.min[1]);
        const zMin = Math.min(this.min[2], other.min[2]);

        const xMax = Math.max(this.max[0], other.max[0]);
        const yMax = Math.max(this.max[1], other.max[1]);
        const zMax = Math.max(this.max[2], other.max[2]);

        this.min = [xMin, yMin, zMin];
        this.max = [xMax, yMax, zMax];
        this.updateCenterAndSize();

        return this;
    }

    /**
     * Returns a tight box that encompasses the given points.
     * @param points The points to encompass.
     * @returns A new box.
     */
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
