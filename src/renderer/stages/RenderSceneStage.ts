import ObjectUniform from "../../materials/uniforms/ObjectUniform";
import Mesh from "../../objects/Mesh";
import BufferStore from "../BufferStore";
import PipelineManager from "../PipelineManager";
import TextureStore from "../TextureStore";
import Stage from "./Stage";

/**
 * A render pipeline stage that render the scene into a color attachment.
 */
class RenderSceneStage extends Stage {
    private renderList: Mesh[];
    private pass: GPURenderPassEncoder;
    private currentPipeline: GPURenderPipeline = null;

    constructor(
        device: GPUDevice,
        bufferStore: BufferStore,
        pipelineManager: PipelineManager,
        textureStore: TextureStore,
        globalValues: ObjectUniform
    ) {
        super(device, bufferStore, pipelineManager, textureStore, globalValues);
    }

    renderMesh(mesh: Mesh, pass: GPURenderPassEncoder) {
        const material = mesh.material;
        const geometry = mesh.geometry;

        const pipeline = this.pipelineManager.getPipeline(material);
        if (this.currentPipeline == null || pipeline != this.currentPipeline) {
            pass.setPipeline(pipeline);
            this.currentPipeline = pipeline;
        }

        this.pipelineManager.bindPipeline(this.currentPipeline, material, pass);

        this.pipelineManager.bindObjectUniforms(pass, mesh);
        this.pipelineManager.bindVertexBuffers(geometry, pass);

        pass.drawIndexed(geometry.indexCount);
    }

    withMeshes(list: Iterable<Mesh> | null) {
        if (list) {
            this.renderList = [...list];
            this.renderList.sort((a, b) => a.material.id - b.material.id);
        } else {
            this.renderList = [];
        }

        return this;
    }

    execute(encoder: GPUCommandEncoder) {
        if (!this.output) {
            throw new Error('no output texture to render into');
        }
        this.currentPipeline = null;
        this.pass = encoder.beginRenderPass(this.renderPassDescriptor);
        this.pipelineManager.bindGlobalValues(this.pass, this.GlobalValues);

        for (const mesh of this.renderList) {
            this.renderMesh(mesh, this.pass);
        }

        this.pass.end();

        return this;
    }
}

export default RenderSceneStage;
