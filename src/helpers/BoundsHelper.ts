import { Box3, Update } from '@core';
import { WireCube } from '@geometries';
import { LineMaterial } from '@materials';
import { Primitive } from '@materials/Material';
import { Node } from '@scene';
import chroma, { Color } from 'chroma-js';

/**
 * Displays the bounds of an object.
 */
export default class BoundsHelper extends Node implements Update {
    readonly source: Node;

    constructor(params: { source: Node; color?: Color }) {
        super();
        this.label = 'BoundsHelper';
        this.material = new LineMaterial({ primitive: Primitive.Lines }).setColor(
            params.color ?? chroma('yellow')
        )
        this.mesh = new WireCube();
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
