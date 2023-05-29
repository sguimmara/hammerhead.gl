import BufferGeometry from "../geometries/BufferGeometry";
import Material from "../materials/Material";

class Mesh {
    material: Material;
    geometry: BufferGeometry;

    constructor(options: {
        material: Material,
        geometry: BufferGeometry
    }) {
        this.material = options.material;
        this.geometry = options.geometry;
    }
}

export default Mesh;
