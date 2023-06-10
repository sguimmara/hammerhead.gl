import { BufferGeometry } from '@/geometries';
import { RenderingMode } from '@/materials';
import { ObjectUniform } from '@/materials/uniforms';
import { Mesh } from '@/objects';
import { Bucket, BufferStore, PipelineManager, TextureStore } from '@/renderer';

import Stage from './Stage';

/**
 * A render pipeline stage that render the scene into a color attachment.
 */
class RenderSceneStage extends Stage {
    private renderList: Bucket[];
    private pass: GPURenderPassEncoder;
    private currentPipeline: GPURenderPipeline = null;
    private currentGeometry: BufferGeometry;

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

        this.pipelineManager.bindPerMaterialUniforms(material, pass);
        this.pipelineManager.bindPerObjectUniforms(pass, mesh);

        switch (material.renderingMode) {
            case RenderingMode.Triangles:
                {
                    if (
                        this.currentGeometry == null ||
                        this.currentGeometry != geometry
                    ) {
                        this.currentGeometry = geometry;
                        this.pipelineManager.bindVertexBuffers(geometry, pass);
                    }

                    pass.drawIndexed(geometry.indexCount);
                }
                break;
            case RenderingMode.TriangleLines: {
                this.pipelineManager.bindVertexBufferUniforms(
                    this.currentPipeline,
                    geometry,
                    pass
                );
                const triangleCount = geometry.indexBuffer.value.length / 3;
                pass.draw(6 * triangleCount, 1, 0, 0);
            }
            case RenderingMode.LineList:
                {
                    this.pipelineManager.bindVertexBufferUniforms(
                        this.currentPipeline,
                        geometry,
                        pass
                    );
                    const lineCount = geometry.indexBuffer.value.length / 2;
                    pass.draw(6 * lineCount, 1, 0, 0);
                }
                break;
            case RenderingMode.Points: {
                this.pipelineManager.bindVertexBufferUniforms(
                    this.currentPipeline,
                    geometry,
                    pass
                );
                const vertexCount = geometry.vertexCount;
                pass.draw(6 * vertexCount);
            }
        }
    }

    withRenderBuckets(buckets: Bucket[]) {
        if (buckets) {
            this.renderList = buckets;
        } else {
            this.renderList = [];
        }

        return this;
    }

    executeStage(encoder: GPUCommandEncoder) {
        if (!this.output) {
            throw new Error("no output texture to render into");
        }
        this.currentPipeline = null;
        this.currentGeometry = null;
        this.pass = encoder.beginRenderPass(this.renderPassDescriptor);
        this.pipelineManager.bindGlobalUniforms(this.pass, this.GlobalValues);

        for (const bucket of this.renderList) {
            for (const mesh of bucket.meshes) {
                this.renderMesh(mesh, this.pass);
            }
        }

        this.pass.end();

        return this;
    }
}

export default RenderSceneStage;
