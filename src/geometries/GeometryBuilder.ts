import { Vec2, vec2 } from "wgpu-matrix";
import BufferGeometry from "./BufferGeometry";
import chroma from "chroma-js";

class GeometryBuilder {
    static quad(center: Vec2, size: Vec2): BufferGeometry {
        const buf = new BufferGeometry({
            vertexCount: 4,
            indexCount: 6
        });

        const x = size[0];
        const y = size[1];
        const cx = center[0];
        const cy = center[1];
        const z = 0.0;
        buf.setVertices([
            -1.0 * x + cx, -1.0 * y + cy, z, // bottom left
            -1.0 * x + cx,  1.0 * y + cy, z, // top left
             1.0 * x + cx,  1.0 * y + cy, z, // top right
             1.0 * x + cx, -1.0 * y + cy, z, // bottom right
        ]);

        buf.setIndices([
            0, 1, 2,
            0, 2, 3
        ]);

        buf.setTexCoords([
            0.0, 1.0, // bottom left
            0.0, 0.0, // top left
            1.0, 0.0, // top right
            1.0, 1.0, // bottom right
        ]);

        // TODO
        buf.setColors(chroma('white'));

        return buf;
    }

    static screenQuad(): BufferGeometry {
        return this.quad(vec2.create(0, 0), vec2.create(1, 1));
    }
}

export default GeometryBuilder;