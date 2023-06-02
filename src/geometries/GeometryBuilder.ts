import { Vec2 } from "../../node_modules/gl-matrix/dist/esm/vec2";
import BufferGeometry from "./BufferGeometry";
import chroma from "chroma-js";

class GeometryBuilder {
    static quad(center: Vec2, size: Vec2): BufferGeometry {
        const buf = new BufferGeometry({
            vertexCount: 4,
            indexCount: 6
        });

        buf.setVertices([
            -1.0 * size.x + center.x, -1.0 * size.y + center.y, 0.0, // bottom left
            -1.0 * size.x + center.x,  1.0 * size.y + center.y, 0.0, // top left
             1.0 * size.x + center.x,  1.0 * size.y + center.y, 0.0, // top right
             1.0 * size.x + center.x, -1.0 * size.y + center.y, 0.0, // bottom right
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
        return this.quad(new Vec2(0, 0), new Vec2(1, 1));
    }
}

export default GeometryBuilder;