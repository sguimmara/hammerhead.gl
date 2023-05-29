import Stage from './Stage';
import Mesh from "../../objects/Mesh";
import ShaderStore from '../ShaderStore';
import TextureStore from "../TextureStore";
import BufferStore from "../BufferStore";
import { BindGroups, VertexBufferSlot } from "../../constants";
import Material from '../../materials/Material';

/**
 * A render pipeline stage that render the scene into a color attachment.
 */
class RenderSceneStage extends Stage {
    private meshes: Mesh[];
    private pass: GPURenderPassEncoder;

    constructor(device: GPUDevice, bufferStore: BufferStore, shaderStore: ShaderStore, textureStore: TextureStore) {
        super(device, bufferStore, shaderStore, textureStore);
    }

    bindTextures(pipeline: GPURenderPipeline, pass: GPURenderPassEncoder, material: Material) {
        const boundTextures = material.getBoundTextures();

        const entries : GPUBindGroupEntry[] = [];

        if (boundTextures) {
            for (const [slot, texture] of boundTextures) {
                const { view, sampler } = this.textureStore.getTexture(texture);

                entries.push({
                    binding: slot * 2, resource: sampler
                });
                entries.push({
                    binding: slot * 2 + 1, resource: view
                });
            }
            const bindGroup = this.device.createBindGroup({
                layout: pipeline.getBindGroupLayout(BindGroups.Textures),
                entries,
            });

            pass.setBindGroup(BindGroups.Textures, bindGroup);
        }
    }

    renderMesh(mesh: Mesh, pass: GPURenderPassEncoder) {
        const material = mesh.material;
        const geometry = mesh.geometry;

        const pipeline = this.shaderStore.getPipeline(material);

        pass.setPipeline(pipeline);

        this.bindTextures(pipeline, pass, material);

        const vertices = this.bufferStore.getVertexBuffer(geometry, VertexBufferSlot.Vertex);
        pass.setVertexBuffer(VertexBufferSlot.Vertex, vertices);
        const texcoord = this.bufferStore.getVertexBuffer(geometry, VertexBufferSlot.TexCoord);
        if (texcoord) {
            pass.setVertexBuffer(VertexBufferSlot.TexCoord, texcoord);
        }
        pass.setIndexBuffer(this.bufferStore.getIndexBuffer(geometry), "uint16");

        pass.drawIndexed(geometry.indexCount);
    }

    withMeshes(list: Iterable<Mesh>) {
        this.meshes = [...list];

        return this;
    }

    execute(encoder: GPUCommandEncoder) {
        this.pass = encoder.beginRenderPass(this.renderPassDescriptor);

        for (const mesh of this.meshes) {
            this.renderMesh(mesh, this.pass);
        }

        this.pass.end();

        return this;
    }
}

export default RenderSceneStage;
