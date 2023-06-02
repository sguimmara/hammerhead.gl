import { BindGroups, VertexBufferSlot } from "../../core/constants";
import PipelineManager from "../PipelineManager";
import Stage from "./Stage";
import BufferStore from "../BufferStore";
import TextureStore from "../TextureStore";
import PostProcessingMaterial from "../../materials/postprocessing/PostProcessingMaterial";
import GlobalValues from '../GlobalValues';
import ObjectUniform from "../ObjectUniform";

class PostProcessingStage extends Stage {
    private pipeline: GPURenderPipeline;
    private bindGroup: GPUBindGroup;
    private material : PostProcessingMaterial;

    constructor(
        device: GPUDevice,
        bufferStore: BufferStore,
        pipelineManager: PipelineManager,
        textureStore: TextureStore,
        GlobalValues: ObjectUniform,
    ) {
        super(device, bufferStore, pipelineManager, textureStore, GlobalValues);
    }

    withMaterial(material: PostProcessingMaterial) {
        if (this.material != material) {
            this.material = material;
            this.pipeline = this.pipelineManager.getPipeline(this.material);
        }

        return this;
    }

    execute(encoder: GPUCommandEncoder) {
        const pass = encoder.beginRenderPass(this.renderPassDescriptor);

        pass.setPipeline(this.pipeline);
        const entries : GPUBindGroupEntry[] = [
            { binding: 0, resource: this.inputView },
            { binding: 1, resource: this.inputSampler },
        ];

        const uniforms = this.material.layout.uniforms;
        if (uniforms.length > 2) {
            for (let i = 2; i < uniforms.length; i++) {
                this.pipelineManager.getBindGroupEntries(this.material, i, entries);
            }
        }

        this.pipelineManager.bindGlobalValues(pass, this.GlobalValues);
        this.bindGroup = this.device.createBindGroup({
            label: 'stage texture bind group',
            layout: this.pipeline.getBindGroupLayout(BindGroups.ObjectUniforms),
            entries
        });
        pass.setBindGroup(BindGroups.ObjectUniforms, this.bindGroup);

        this.pipelineManager.bindVertexBuffers(this.quad, pass);

        pass.drawIndexed(this.quad.indexCount);

        pass.end();

        return this;
    }
}

export default PostProcessingStage;