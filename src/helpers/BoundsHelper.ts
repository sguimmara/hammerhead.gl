import Mesh from "../objects/Mesh";
import Object3D from "../objects/Object3D";
import WireCube from '../geometries/WireCube';
import BasicMaterial from "../materials/BasicMaterial";
import { RenderingMode } from "../materials/Material";
import chroma, { Color } from "chroma-js";
import Update from "../core/Update";
import Box3 from "../core/Box3";

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