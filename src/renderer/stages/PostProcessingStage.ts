import { BindGroups, VertexBufferSlot } from "../../constants";
import Material from "../../materials/Material";
import PipelineManager from "../PipelineManager";
import Stage from "./Stage";
import BufferStore from "../BufferStore";
import TextureStore from "../TextureStore";

class PostProcessingStage extends Stage {
    private pipeline: GPURenderPipeline;
    private bindGroup: GPUBindGroup;
    private material : Material;

    constructor(device: GPUDevice, bufferStore: BufferStore, pipelineManager: PipelineManager, textureStore: TextureStore) {
        super(device, bufferStore, pipelineManager, textureStore);
    }

    withMaterial(material: Material) {
        if (this.material != material) {
            this.material = material;
            this.pipeline = this.pipelineManager.getPipeline(this.material);
        }

        return this;
    }

    execute(encoder: GPUCommandEncoder) {
        const pass = encoder.beginRenderPass(this.renderPassDescriptor);

        pass.setPipeline(this.pipeline);
        this.bindGlobalUniforms(pass);
        this.bindGroup = this.device.createBindGroup({
            label: 'stage texture bind group',
            layout: this.pipeline.getBindGroupLayout(BindGroups.Textures),
            entries: [
                { binding: 0, resource: this.inputSampler },
                { binding: 1, resource: this.inputView },
            ]
        });
        pass.setBindGroup(BindGroups.Textures, this.bindGroup);

        const vertices = this.bufferStore.getVertexBuffer(this.quad, VertexBufferSlot.Vertex);
        pass.setVertexBuffer(VertexBufferSlot.Vertex, vertices);
        const texcoord = this.bufferStore.getVertexBuffer(this.quad, VertexBufferSlot.TexCoord);
        if (texcoord) {
            pass.setVertexBuffer(VertexBufferSlot.TexCoord, texcoord);
        }
        pass.setIndexBuffer(this.bufferStore.getIndexBuffer(this.quad), "uint16");

        pass.drawIndexed(this.quad.indexCount);

        pass.end();

        return this;
    }
}

export default PostProcessingStage;