import BufferGeometry from "../geometries/BufferGeometry";
import Mesh from "../objects/Mesh";
import Loader from "./Loader";
import { parse } from '@loaders.gl/core';
import { OBJLoader as Lib } from '@loaders.gl/obj';

export default class OBJLoader implements Loader {
    async loadFromURI(uri: string): Promise<Mesh> {
        const res = await fetch(uri);
        const text = await res.text();
        const data = await parse(text, Lib);

        throw new Error('not implemented');
    }
}