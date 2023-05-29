import Stage from './Stage';
import Mesh from "../../objects/Mesh";
import PipelineManager from '../PipelineManager';
import TextureStore from "../TextureStore";
import BufferStore from "../BufferStore";
import { VertexBufferSlot } from "../../constants";
import BufferGeometry from '../../geometries/BufferGeometry';

/**
 * A render pipeline stage that render the scene into a color attachment.
 */
class RenderSceneStage extends Stage {
    private meshes: Mesh[];
    private pass: GPURenderPassEncoder;
    private currentPipeline: GPURenderPipeline;

    constructor(device: GPUDevice, bufferStore: BufferStore, pipelineManager: PipelineManager, textureStore: TextureStore) {
        super(device, bufferStore, pipelineManager, textureStore);
    }

    renderMesh(mesh: Mesh, pass: GPURenderPassEncoder) {
        const material = mesh.material;
        const geometry = mesh.geometry;

        const pipeline = this.pipelineManager.getPipeline(material);
        if (pipeline != this.currentPipeline) {
            pass.setPipeline(pipeline);
            this.currentPipeline = pipeline;
        }

        this.bindObjectUniforms(this.currentPipeline, pass, material);

        this.bindVertexBuffers(geometry, pass);

        pass.drawIndexed(geometry.indexCount);
    }

    private bindVertexBuffers(geometry: BufferGeometry, pass: GPURenderPassEncoder) {
        const vertices = this.bufferStore.getVertexBuffer(geometry, VertexBufferSlot.Vertex);
        pass.setVertexBuffer(VertexBufferSlot.Vertex, vertices);
        const texcoord = this.bufferStore.getVertexBuffer(geometry, VertexBufferSlot.TexCoord);
        if (texcoord) {
            pass.setVertexBuffer(VertexBufferSlot.TexCoord, texcoord);
        }
        pass.setIndexBuffer(this.bufferStore.getIndexBuffer(geometry), "uint16");
    }

    withMeshes(list: Iterable<Mesh>) {
        this.meshes = [...list];
        this.meshes.sort((a, b) => a.material.id - b.material.id);

        return this;
    }

    execute(encoder: GPUCommandEncoder) {
        this.pass = encoder.beginRenderPass(this.renderPassDescriptor);
        this.bindGlobalUniforms(this.pass);

        for (const mesh of this.meshes) {
            this.renderMesh(mesh, this.pass);
        }

        this.pass.end();

        return this;
    }
}

export default RenderSceneStage;
