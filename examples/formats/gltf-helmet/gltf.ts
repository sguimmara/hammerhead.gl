import { MeshObject, Node, Scene } from "hammerhead.gl/scene";
import { parse } from "@loaders.gl/core";
import * as gltf from "@loaders.gl/gltf";
import { Scene as GltfScene } from "@loaders.gl/gltf/dist/lib/types/gltf-postprocessed-schema";
import { Attribute, Mesh } from "hammerhead.gl/geometries";
import { Material, MetallicRoughnessMaterial } from "hammerhead.gl/materials";
import { Transform } from "hammerhead.gl/core";
import Texture from "hammerhead.gl/textures/Texture";
import ImageSource from "hammerhead.gl/textures/ImageSource";
import GL from "./GL";

let DEFAULT_TEXTURE: Texture;

function mapAttributeName(input: string): Attribute {
    switch (input) {
        case "POSITION":
            return "position";
        case "TEXCOORD_0":
            return "texcoord";
        case "NORMAL":
            return "normal";
        case "TANGENT":
            return "tangent";
        case "TEXCOORD_1":
            return "texcoord1";
        case "TEXCOORD_2":
            return "texcoord2";
        default:
            throw new Error("glTF attribute unrecognized: " + input);
    }
}

class GLTFLoader {
    context: gltf.GLTFPostprocessed;

    processVertexBuffer(
        attribute: gltf.GLTFAccessorPostprocessed
    ): Float32Array {
        const bufferView = attribute.bufferView;
        const buf = bufferView.buffer.arrayBuffer;
        let result;
        let componentSize;
        switch (attribute.type) {
            case 'VEC3': componentSize = 3; break;
            case 'VEC2': componentSize = 2; break;
            case 'VEC4': componentSize = 4; break;
        }
        result = new Float32Array(buf, bufferView.byteOffset, attribute.count * componentSize);
        return result;
    }

    processIndexBuffer(
        indices: gltf.GLTFAccessorPostprocessed
    ): Uint16Array | Uint32Array {
        const bufferView = indices.bufferView;
        const buf = bufferView.buffer.arrayBuffer;
        let result;
        switch (indices.componentType) {
            case GL.UNSIGNED_SHORT:
                result = new Uint16Array(
                    buf,
                    bufferView.byteOffset,
                    indices.count
                );
                break;
            case GL.UNSIGNED_INT:
                result = new Uint32Array(
                    buf,
                    bufferView.byteOffset,
                    indices.count
                );
                break;
        }

        return result;
    }

    processGeometry(mesh: gltf.GLTFMeshPrimitivePostprocessed): Mesh {
        const result = new Mesh({ frontFace: "ccw" });

        const indexArray = this.processIndexBuffer(mesh.indices);

        result.setIndices(indexArray);

        for (const key of Object.keys(mesh.attributes)) {
            const attr = mapAttributeName(key);
            const buf = this.processVertexBuffer(mesh.attributes[key]);
            result.setAttribute(attr, buf);
        }

        return result;
    }

    processTexture(texInfo: gltf.GLTFTexturePostprocessed): Texture {
        const source = texInfo.source;
        const tex = new Texture({
            source: new ImageSource(source.image as ImageBitmap),
        });
        tex.label = source.uri;

        return tex;
    }

    processMetallicRoughnessMaterial(material: gltf.GLTFMaterialPostprocessed): Material {
        const result = new MetallicRoughnessMaterial();
        const pbr = material.pbrMetallicRoughness;

        if (pbr) {
            if (pbr.baseColorTexture) {
                const albedo = this.processTexture(pbr.baseColorTexture.texture);
                albedo.format = "rgba8unorm-srgb";
                result.setAlbedoTexture(albedo);
            }
            if (pbr.metallicRoughnessTexture) {
                const metalRoughness = this.processTexture(
                    pbr.metallicRoughnessTexture.texture
                );
                result.setMetalRoughnessTexture(metalRoughness);
            }
            if (pbr.baseColorFactor) {
                result.setBaseColorFactor(pbr.baseColorFactor);
            }
            if (pbr.metallicFactor) {
                result.setMetallicFactor(pbr.metallicFactor);
            }
            if (pbr.roughnessFactor) {
                result.setRoughnessFactor(pbr.roughnessFactor);
            }
        }
        if (material.emissiveTexture) {
            const emissive = this.processTexture(material.emissiveTexture.texture);
            result.setEmissiveTexture(emissive);
        }
        if (material.occlusionTexture) {
            const ao = this.processTexture(material.occlusionTexture.texture);
            result.setAmbientOcclusionTexture(ao);
        }
        if (material.normalTexture) {
            const normal = this.processTexture(material.normalTexture.texture);
            result.setNormalTexture(normal);
        }

        return result;
    }

    processMesh(mesh: gltf.GLTFMeshPostprocessed): MeshObject[] {
        const result: MeshObject[] = [];

        for (const prim of mesh.primitives) {
            const mesh = this.processGeometry(prim);
            const material = this.processMetallicRoughnessMaterial(prim.material);

            result.push(new MeshObject({ material, mesh }));
        }

        return result;
    }

    processNode(node: gltf.GLTFNodePostprocessed): Node {
        const result = new Node();
        if (node.mesh) {
            const meshes = this.processMesh(node.mesh);
            result.addMany(meshes);
        } else if (node.camera) {
            throw new Error("not implemented: camera");
        }

        result.label = node.name ?? "GLTFNode";

        const xform: Transform = result.transform;
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
            const children = node.children.map((n) => this.processNode(n));
            result.addMany(children);
        }

        return result;
    }

    processScene(gltfScene: GltfScene): Scene {
        const scene = new Scene();
        scene.label = gltfScene.name ?? "GLTFScene";

        if (gltfScene.nodes) {
            const children = gltfScene.nodes.map((n) => this.processNode(n));
            scene.addMany(children);
        }

        return scene;
    }

    async loadGltfScene(uri: string, baseUri: string): Promise<Scene[]> {
        const res = await fetch(uri);
        const buf = await res.arrayBuffer();

        const context: gltf.GLTFPostprocessed = await parse(
            buf,
            gltf.GLTFLoader,
            {
                baseUri,
            }
        );

        this.context = context;

        if (context.scenes) {
            const scenes = context.scenes.map((scene) =>
                this.processScene(scene)
            );
            return scenes;
        }

        return [];
    }
}

export default GLTFLoader;
