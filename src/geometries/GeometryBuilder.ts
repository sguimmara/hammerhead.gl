import BufferGeometry from "./BufferGeometry";

class GeometryBuilder {
    static screenQuad(): BufferGeometry {
        const buf = new BufferGeometry({
            vertexCount: 4,
            indexCount: 6
        });

        buf.setVertices([
            -1.0, -1.0, 0.0, // bottom left
            -1.0,  1.0, 0.0, // top left
             1.0,  1.0, 0.0, // top right
             1.0, -1.0, 0.0, // bottom right
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

        return buf;
    }
}

export default GeometryBuilder;