/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { parse } from '@loaders.gl/core';
import * as ply from '@loaders.gl/ply';

import Texture from 'hammerhead.gl/textures/Texture';
import Camera from 'hammerhead.gl/scene/Camera';
import Box3 from 'hammerhead.gl/core/Box3';
import ImageSource from 'hammerhead.gl/textures/ImageSource';
import { Mesh } from 'hammerhead.gl/geometries';
import { Node } from 'hammerhead.gl/scene';

export async function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function frameBounds(bounds: Box3, camera: Camera) {
    const [x, y, z] = bounds.center;
    const maxSize = Math.max(bounds.size[0], bounds.size[1], bounds.size[2]);
    const distance = Math.tan(camera.fieldOfView) * maxSize + maxSize;

    camera.transform.setPosition(distance, y, z);
    camera.transform.lookAt(x, y, z);
    camera.nearPlane = distance * 0.01;
    camera.farPlane = distance * 2;
}

export function frameObject(obj: Node, camera: Camera) {
    const bounds = obj.getWorldBounds();

    frameBounds(bounds, camera);
}

function buildUrl(url: string) {
    let base = '';
    if (import.meta.env.PROD) {
        base = import.meta.env.BASE_URL;
    }

    return `${base}${url}`;
}

export async function loadPLYModel(): Promise<Mesh> {
    const res = await fetch(buildUrl('/files/hammerhead.ply'));
    const text = await res.text();
    const data = await parse(text, ply.PLYLoader);

    const vertices = data.attributes.POSITION.value as Float32Array;
    const indices = data.indices.value as Uint32Array;

    const mesh = new Mesh({ frontFace: 'ccw' });
    mesh.setIndices(indices);
    mesh.setAttribute('position', vertices);

    return mesh;
}

export function load8bitImage(url: string): Promise<Texture> {
    const img = new Image();
    return new Promise((resolve, reject) => {
        img.crossOrigin = 'anonymous';
        img.src = buildUrl(url);
        img.onerror = reject;
        img.onload = () => {
            const source = new ImageSource(img);
            const texture = new Texture({ source });
            resolve(texture);
        }
    });
}
