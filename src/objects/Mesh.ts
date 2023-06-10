import { Box3 } from "@/core";
import { BufferGeometry } from "@/geometries";
import { Material } from "@/materials";
import { vec3 } from "wgpu-matrix";

import Object3D from "./Object3D";

/**
 * A renderable {@link Object3D} that combines a {@link Material}
 * and a {@link BufferGeometry} to display meshes.
 * @example
 * const mesh = new Mesh({
 *      material: new BasicMaterial(),
 *      geometry: new Cube(),
 * });
 */
export default class Mesh extends Object3D {
    material: Material;
    geometry: BufferGeometry;
    readonly isMesh: boolean = true;

    /**
     * Creates a mesh with the given geometry and material.
     * @param params Params.
     */
    constructor(params: {
        material: Material,
        geometry: BufferGeometry,
    }) {
        super();
        this.material = params.material;
        this.geometry = params.geometry;
    }

    getWorldBounds(): Box3 {
        const localBounds = this.geometry.getLocalBounds();

        this.transform.updateWorldMatrix(this.parent?.transform);

        const vertices: number[] = [];
        const worldMatrix = this.transform.worldMatrix;
        localBounds.forEachCorner((c) => {
            const c2 = vec3.transformMat4(c, worldMatrix);
            vertices.push(c2[0]);
            vertices.push(c2[1]);
            vertices.push(c2[2]);
        });

        const worldBounds = Box3.fromPoints(vertices);

        return worldBounds;
    }
}
