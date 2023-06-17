import chroma from "chroma-js";
import { parse } from "@loaders.gl/core";
import * as ply from '@loaders.gl/ply';

import BufferGeometry from 'hammerhead.gl/geometries/BufferGeometry';
import Texture from 'hammerhead.gl/textures/Texture';
import Mesh from 'hammerhead.gl/objects/Mesh';
import Camera from 'hammerhead.gl/objects/Camera';
import Box3 from 'hammerhead.gl/core/Box3';

export async function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function frameBounds(bounds: Box3, camera: Camera) {
    const [x, y, z] = bounds.center;
    const [mx, my, mz] = bounds.max;
    camera.transform.setPosition(mx * 3, my * 3, mz * 3);
    camera.transform.lookAt(x, y, z);
}

export function frameObject(obj: Mesh, camera: Camera) {
    const geometry = obj.geometry;
    const bounds = geometry.getLocalBounds();
    frameBounds(bounds, camera);
}

export async function loadPLYModel(uri: string): Promise<BufferGeometry> {
    const res = await fetch(uri);
    const text = await res.text();
    const data = await parse(text, ply.PLYLoader);

    const vertices = data.attributes.POSITION.value as Float32Array;
    const indices = data.indices.value as Uint32Array;

    const geometry = new BufferGeometry({
        vertexCount: vertices.length,
        indexCount: indices.length,
        indexBuffer: indices,
        vertices,
    });

    geometry.getLocalBounds();
    geometry.setColors(chroma('white'));
    geometry.setTexCoords();

    return geometry;
}

export function load8bitImage(url: string): Promise<Texture> {
    const img = new Image();
    return new Promise((resolve, reject) => {
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onerror = reject;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('could not acquire 2d context');
            }
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const texture = new Texture({
                width: img.width,
                height: img.height,
                data: data.data
            });
            resolve(texture);
        }
    });
}
