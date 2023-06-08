import { Vec3, mat4, vec3, vec4 } from "wgpu-matrix";
import Box3 from "../core/Box3";
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

    getWorldBounds(): Box3 {
        const localBounds = this.geometry.getLocalBounds();

        this.transform.updateWorldMatrix(this.parent?.transform);

        const vertices: number[] = [];
        const worldMatrix = this.transform.worldMatrix;
        localBounds.forEachCorner(c => {
            const c2 = vec3.transformMat4(c, worldMatrix);
            vertices.push(c2[0]);
            vertices.push(c2[1]);
            vertices.push(c2[2]);
        });

        const worldBounds = Box3.fromPoints(vertices);

        return worldBounds;
    }
}
