import { BindGroup } from '@core';
import { PostProcessingMaterial } from '@materials/postprocessing';
import { ObjectUniform } from '@materials/uniforms';

import BufferStore from '@renderer/BufferStore';
import PipelineManager from '@renderer/PipelineManager';
import TextureStore from '@renderer/TextureStore';
import Stage from './Stage';

class PostProcessingStage extends Stage {
    private pipeline: GPURenderPipeline;
    private bindGroup: GPUBindGroup;
    private material: PostProcessingMaterial;

    constructor(
        device: GPUDevice,
        bufferStore: BufferStore,
        pipelineManager: PipelineManager,
        textureStore: TextureStore,
        GlobalValues: ObjectUniform
    ) {
        super(device, bufferStore, pipelineManager, textureStore, GlobalValues);
    }

    withMaterial(material: PostProcessingMaterial) {
        if (this.material != material) {
            this.material = material;
            this.pipeline = this.pipelineManager.getPipeline(this.material, this.quad);
        }

        return this;
    }

    executeStage(encoder: GPUCommandEncoder) {
        const pass = encoder.beginRenderPass(this.renderPassDescriptor);

        pass.setPipeline(this.pipeline);
        const entries: GPUBindGroupEntry[] = [];

        // Hardcoded inputs to the post-processing material.
        entries.push({
            binding: this.material.layout.getUniformBinding('colorTexture'),
            resource: this.inputView,
        });
        entries.push({
            binding: this.material.layout.getUniformBinding('colorSampler'),
            resource: this.inputSampler,
        });

        const uniforms = this.material.layout.uniforms;
        for (let i = 0; i < uniforms.length; i++) {
            const uniform = uniforms[i];
            // TODO find a better way to distinguish between "hardcoded" input
            // and regular uniforms. Maybe a dedicated group ?
            if (uniform.name !== 'colorTexture' && uniform.name !== 'colorSampler') {
                this.pipelineManager.getBindGroupEntries(
                    this.material,
                    i,
                    entries
                );
            }
        }

        this.pipelineManager.bindGlobalUniforms(pass, this.GlobalValues);
        this.bindGroup = this.device.createBindGroup({
            label: 'stage texture bind group',
            layout: this.pipeline.getBindGroupLayout(
                BindGroup.MaterialUniforms
            ),
            entries,
        });
        pass.setBindGroup(BindGroup.MaterialUniforms, this.bindGroup);

        this.pipelineManager.bindVertexBuffers(this.quad, this.material, pass);

        pass.drawIndexed(this.quad.indexCount);

        pass.end();

        return this;
    }
}

export default PostProcessingStage;
