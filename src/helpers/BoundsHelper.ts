import { Box3, Update } from '@/core';
import { WireCube } from '@/geometries';
import { BasicMaterial, RenderingMode } from '@/materials';
import { Mesh, Object3D } from '@/objects';
import chroma, { Color } from 'chroma-js';

export default class BoundsHelper
    extends Mesh
    implements Update {
    readonly source: Object3D;

    constructor(params : { source: Object3D, color?: Color }) {
        super({
            material: new BasicMaterial({
                renderingMode: RenderingMode.LineList })
                .withDiffuseColor(params.color ?? chroma('yellow')),
            geometry: new WireCube()});
        this.source = params.source;
    }

    /**
     * Returns null.
     * @returns `null`.
     */
    getWorldBounds(): Box3 {
        // We don't want to interfere with the bounds computation of our parent.
        return null;
    }

    update(): void {
        const bounds = this.source.getWorldBounds();
        this.transform.setPosition(bounds.center);
        const size = bounds.size;
        this.transform.setScale(size);
    }
}
