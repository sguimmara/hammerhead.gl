import { Mesh, Object3D, Scene } from "hammerhead.gl/objects";
import { parse } from "@loaders.gl/core";
import * as gltf from "@loaders.gl/gltf";
import { Scene as GltfScene } from "@loaders.gl/gltf/dist/lib/types/gltf-postprocessed-schema";
import { BufferGeometry, Cube } from "hammerhead.gl/geometries";
import { BasicMaterial, FrontFace, Material, PBRMaterial, RenderingMode } from "hammerhead.gl/materials";
import chroma from "chroma-js";
import { Transform } from "hammerhead.gl/core";
import Texture from "hammerhead.gl/textures/Texture";
import ImageSource from "hammerhead.gl/textures/ImageSource";
import { load8bitImage } from "../../lib";
import { TextureInfo } from "@loaders.gl/gltf/dist/lib/types/gltf-json-schema";

const GL : WebGL2RenderingContext = null;

function sizeof(componentType: number, type: string) {
    let count;
    switch (type) {
        case 'SCALAR': count = 1; break;
        case 'VEC2': count = 2; break;
        case 'VEC3': count = 3; break;
        case 'VEC4': count = 4; break;
        case 'VEC4': count = 4; break;
        case 'MAT3': count = 9; break;
        case 'MAT4': count = 16; break;
    }

    let size;

    switch (componentType) {
        case GL.FLOAT: size = 4; break;
        case GL.INT: size = 4; break;
        case GL.INT: size = 4; break;
        case GL.BYTE: size = 1; break;
        case GL.UNSIGNED_BYTE: size = 1; break;
        case GL.SHORT: size = 2; break;
        case GL.UNSIGNED_SHORT: size = 2; break;
    }

    return size * count;
}

function expandToUInt32Array(uint16: Uint16Array) : Uint32Array {
    const result = new Uint32Array(uint16.length);
    for (let i = 0; i < uint16.length; i++) {
        result[i] = uint16[i];
    }

    return result;
}

function processGeometry(
    mesh: gltf.GLTFMeshPrimitivePostprocessed,
): BufferGeometry {
    let vertexCount = mesh.attributes['POSITION'].count;
    let vertices = mesh.attributes['POSITION'].value as Float32Array;

    const indices = expandToUInt32Array(mesh.indices.value as Uint16Array);
    const result = new BufferGeometry({ indexCount: indices.length, vertexCount, vertices, indexBuffer: indices });

    for (const attr of Object.keys(mesh.attributes)) {
        switch (attr) {
            case 'TEXCOORD_0':
                const buf = mesh.attributes[attr].value as Float32Array;
                result.setTexCoords(buf);
                break;
            // TODO NORMAL
        }
    }

    result.setColors(chroma('white'));

    return result;
}

function processTexture(texInfo: gltf.GLTFTexturePostprocessed): Texture {
    const source = texInfo.source;
    const tex = new Texture({ source: new ImageSource(source.image as ImageBitmap)});
    tex.label = source.uri;

    return tex;
}

function processMaterial(material: gltf.GLTFMaterialPostprocessed): Material {
    const albedo = processTexture(material.pbrMetallicRoughness.baseColorTexture.texture);

    // TODO
    // When a mesh primitive uses any triangle-based topology (i.e., triangles, triangle strip, or triangle fan),
    // the determinant of the node’s global transform defines the winding order of that primitive.
    // If the determinant is a positive value, the winding order triangle faces is counterclockwise;
    // in the opposite case, the winding order is clockwise.
    return new PBRMaterial({ frontFace: FrontFace.CCW })
        .setAlbedoTexture(albedo);
}

function processMesh(
    mesh: gltf.GLTFMeshPostprocessed,
): Mesh[] {
    const result: Mesh[] = [];

    for (const prim of mesh.primitives) {
        const geometry = processGeometry(prim);
        const material = processMaterial(prim.material);

        result.push(new Mesh({ material, geometry }));
    }

    return result;
}

function processNode(
    node: gltf.GLTFNodePostprocessed,
    gltf: gltf.GLTFPostprocessed
): Object3D {
    const result = new Object3D();
    if (node.mesh) {
        const meshes = processMesh(node.mesh);
        result.addMany(meshes);
    } else if (node.camera) {
        throw new Error("not implemented: camera");
    }

    result.label = node.name ?? "GLTFNode";

    // TODO ZUP ?
    const xform : Transform = result.transform;
    if (node.scale) {
        xform.setScale(node.scale);
    }
    // TODO rotation
    if (node.translation) {
        xform.setPosition(node.translation);
    }

    if (node.children) {
        const children = node.children.map((n) => processNode(n, gltf));
        result.addMany(children);
    }

    return result;
}

function processScene(
    gltfScene: GltfScene,
    gltf: gltf.GLTFPostprocessed
): Scene {
    const scene = new Scene();
    scene.label = gltfScene.name ?? "GLTFScene";

    if (gltfScene.nodes) {
        const children = gltfScene.nodes.map((n) => processNode(n, gltf));
        scene.addMany(children);
    }

    return scene;
}

let DEFAULT_TEXTURE : Texture;

export async function loadGltfScene(
    uri: string,
    baseUri: string
): Promise<Scene[]> {
    const res = await fetch(uri);
    const buf = await res.arrayBuffer();

    // TODO remove
    if (!DEFAULT_TEXTURE) {
        DEFAULT_TEXTURE = await load8bitImage('/checkerboard.jpg');
    }

    const data: gltf.GLTFPostprocessed = await parse(buf, gltf.GLTFLoader, {
        baseUri,
    });

    if (data.scenes) {
        const scenes = data.scenes.map((scene) => processScene(scene, data));
        return scenes;
    }

    return [];
}
