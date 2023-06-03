import { parse } from "@loaders.gl/core";
import * as ply from '@loaders.gl/ply';
import Loader from "./Loader";
import Mesh from "../objects/Mesh";
import BufferGeometry from "../geometries/BufferGeometry";
import BasicMaterial from "../materials/BasicMaterial";
import chroma from "chroma-js";

export default class PLYLoader implements Loader {
    zUp: boolean;

    constructor(params : {
        zUp?: boolean,
    } = {}) {
        this.zUp = params.zUp ?? false;
    }

    async loadFromURI(uri: string): Promise<Mesh> {
        const res = await fetch(uri);
        const text = await res.text();
        const data = await parse(text, ply.PLYLoader);

        const vertices = data.attributes.POSITION.value as Float32Array;
        const indices = data.indices.value as Uint32Array;

        if (this.zUp) {
            for (let i = 0; i < vertices.length; i+=3) {
                const y = vertices[i + 1];
                const z = vertices[i + 2];
                vertices[i + 1] = z;
                vertices[i + 2] = y;
            }
        }

        const geometry = new BufferGeometry({
            vertexCount: vertices.length,
            indexCount: indices.length,
            indexBuffer: indices,
            vertices,
        });

        geometry.computeBounds();
        geometry.setColors(chroma('white'));
        geometry.setTexCoords();

        const mesh = new Mesh({
            geometry,
            material: new BasicMaterial(),
        });

        return mesh;
    }
}