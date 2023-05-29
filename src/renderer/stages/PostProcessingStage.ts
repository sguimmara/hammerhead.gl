import { VertexBufferSlot } from "../../constants";
import Material from "../../materials/Material";
import ShaderStore from "../ShaderStore";
import Stage from "./Stage";
import BufferStore from "../BufferStore";
import TextureStore from "../TextureStore";

class PostProcessingStage extends Stage {
    private pipeline: GPURenderPipeline;
    private bindGroup: GPUBindGroup;
    private material : Material;

    constructor(device: GPUDevice, bufferStore: BufferStore, shaderStore: ShaderStore, textureStore: TextureStore) {
        super(device, bufferStore, shaderStore, textureStore);
    }

    withMaterial(material: Material) {
        if (this.material != material) {
            this.material = material;
            this.pipeline = this.shaderStore.getPipeline(this.material);
        }

        return this;
    }

    execute(encoder: GPUCommandEncoder) {
        const pass = encoder.beginRenderPass(this.renderPassDescriptor);

        pass.setPipeline(this.pipeline);
        this.bindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: this.inputSampler },
                { binding: 1, resource: this.inputView },
            ]
        });
        pass.setBindGroup(0, this.bindGroup);

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