import { Mesh } from '@/geometries';
import { RenderingMode } from '@/materials';
import { ObjectUniform } from '@/materials/uniforms';
import { MeshObject } from '@/scene';
import { Bucket, BufferStore, PipelineManager, TextureStore } from '@/renderer';

import Stage from './Stage';

/**
 * A render pipeline stage that render the scene into a color attachment.
 */
class RenderSceneStage extends Stage {
    private renderList: Bucket[];
    private pass: GPURenderPassEncoder;
    private currentPipeline: GPURenderPipeline = null;
    private currentGeometry: Mesh;

    constructor(
        device: GPUDevice,
        bufferStore: BufferStore,
        pipelineManager: PipelineManager,
        textureStore: TextureStore,
        globalValues: ObjectUniform
    ) {
        super(device, bufferStore, pipelineManager, textureStore, globalValues);
    }

    renderMesh(meshObject: MeshObject, pass: GPURenderPassEncoder) {
        const material = meshObject.material;
        const mesh = meshObject.mesh;

        const pipeline = this.pipelineManager.getPipeline(material);
        if (this.currentPipeline == null || pipeline != this.currentPipeline) {
            pass.setPipeline(pipeline);
            this.currentPipeline = pipeline;
        }

        this.pipelineManager.bindPerMaterialUniforms(material, pass);
        this.pipelineManager.bindPerObjectUniforms(pass, meshObject);

        switch (material.renderingMode) {
            case RenderingMode.Triangles:
                {
                    if (
                        this.currentGeometry == null ||
                        this.currentGeometry != mesh
                    ) {
                        this.currentGeometry = mesh;
                        this.pipelineManager.bindVertexBuffers(mesh, material, pass);
                    }

                    pass.drawIndexed(mesh.indexCount);
                }
                break;
            case RenderingMode.TriangleLines: {
                this.pipelineManager.bindVertexBufferUniforms(
                    this.currentPipeline,
                    mesh,
                    pass
                );
                const triangleCount = mesh.indexCount / 3;
                pass.draw(6 * triangleCount, 1, 0, 0);
            }
            case RenderingMode.LineList:
                {
                    this.pipelineManager.bindVertexBufferUniforms(
                        this.currentPipeline,
                        mesh,
                        pass
                    );
                    const lineCount = mesh.indexCount / 2;
                    pass.draw(6 * lineCount, 1, 0, 0);
                }
                break;
            case RenderingMode.Points: {
                this.pipelineManager.bindVertexBufferUniforms(
                    this.currentPipeline,
                    mesh,
                    pass
                );
                const vertexCount = mesh.vertexCount;
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
