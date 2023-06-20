import { MeshObject, Object3D, Scene } from "hammerhead.gl/scene";
import { parse } from "@loaders.gl/core";
import * as gltf from "@loaders.gl/gltf";
import { Scene as GltfScene } from "@loaders.gl/gltf/dist/lib/types/gltf-postprocessed-schema";
import { Mesh } from "hammerhead.gl/geometries";
import { Material, MetallicRoughnessMaterial } from "hammerhead.gl/materials";
import { Transform } from "hammerhead.gl/core";
import Texture from "hammerhead.gl/textures/Texture";
import ImageSource from "hammerhead.gl/textures/ImageSource";

function processGeometry(
    mesh: gltf.GLTFMeshPrimitivePostprocessed,
): Mesh {
    let vertices = mesh.attributes['POSITION'].value as Float32Array;

    const indices = mesh.indices.value;
    const result = new Mesh({ frontFace: 'ccw' });

    result.setIndices(indices);
    result.setAttribute('position', vertices);

    for (const attr of Object.keys(mesh.attributes)) {
        switch (attr) {
            case 'TEXCOORD_0':
                const texCoord0 = mesh.attributes[attr].value as Float32Array;
                result.setAttribute('texcoord', texCoord0);
                break;
            case 'NORMAL':
                const normals = mesh.attributes[attr].value as Float32Array;
                result.setAttribute('normal', normals);
                break;
            // TODO missing attributes
        }
    }

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
    albedo.format = 'rgba8unorm-srgb';

    const emissive = processTexture(material.emissiveTexture.texture);
    const ao = processTexture(material.occlusionTexture.texture);
    const normal = processTexture(material.normalTexture.texture);
    const metalRoughness = processTexture(material.pbrMetallicRoughness.metallicRoughnessTexture.texture);
    // emissive.format = 'rgba8unorm-srgb'; // TODO

    return new MetallicRoughnessMaterial()
        .setAlbedoTexture(albedo)
        .setAmbientOcclusionTexture(ao)
        .setNormalTexture(normal)
        .setMetalRoughnessTexture(metalRoughness)
        .setEmissiveTexture(emissive);
}

function processMesh(
    mesh: gltf.GLTFMeshPostprocessed,
): MeshObject[] {
    const result: MeshObject[] = [];

    for (const prim of mesh.primitives) {
        const mesh = processGeometry(prim);
        const material = processMaterial(prim.material);

        result.push(new MeshObject({ material, mesh }));
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

    const xform : Transform = result.transform;
    if (node.scale) {
        xform.setScale(node.scale);
    }
    if (node.rotation) {
        xform.setQuaternion(node.rotation);
    }
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

    const data: gltf.GLTFPostprocessed = await parse(buf, gltf.GLTFLoader, {
        baseUri,
    });

    if (data.scenes) {
        const scenes = data.scenes.map((scene) => processScene(scene, data));
        return scenes;
    }

    return [];
}
