import BufferGeometry from "../geometries/BufferGeometry";
import Material from "../materials/Material";
import Object3D from "./Object3D";

export default class Mesh extends Object3D {
    material: Material;
    geometry: BufferGeometry;
    readonly isMesh: boolean = true;

    constructor(options: {
        material: Material,
        geometry: BufferGeometry
    }) {
        super();
        this.material = options.material;
        this.geometry = options.geometry;
    }
}
