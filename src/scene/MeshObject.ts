import { Box3 } from '@core';
import { Mesh } from '@geometries';
import { Material } from '@materials';
import { vec3 } from 'wgpu-matrix';

import Node from './Node';

/**
 * A renderable {@link Node} that combines a {@link Material}
 * and a {@link Mesh} to display meshes.
 * @example
 * const mesh = new MeshObject({
 *      material: new BasicMaterial(),
 *      mesh: new Cube(),
 * });
 */
// TODO remove
export default class MeshObject extends Node {
    material: Material;
    mesh: Mesh;
    readonly isMesh: boolean = true;

    /**
     * Creates a mesh with the given geometry and material.
     * @param params Params.
     */
    constructor(params: {
        material: Material,
        mesh: Mesh,
    }) {
        super();
        this.material = params.material;
        this.mesh = params.mesh;
    }

    getWorldBounds(): Box3 {
        const localBounds = this.mesh.getBounds();

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

        if (this.children) {
            const childCount = this.children.length;
            for (let i = 0; i < childCount; i++) {
                const child = this.children[i];
                worldBounds.expand(child.getWorldBounds());
            }
        }

        return worldBounds;
    }
}
