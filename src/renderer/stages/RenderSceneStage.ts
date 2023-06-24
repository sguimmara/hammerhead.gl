import { Mesh } from "@/geometries";
import { ObjectUniform } from "@/materials/uniforms";
import { MeshObject } from "@/scene";
import { Bucket, BufferStore, PipelineManager, TextureStore } from "@/renderer";

import Stage from "./Stage";
import { Material } from "@/materials";
import { BindGroup } from "@/core";
import { Primitive } from "@/materials/Material";

/**
 * A render pipeline stage that render the scene into a color attachment.
 */
class RenderSceneStage extends Stage {
    private renderList: Bucket[];
    private pass: GPURenderPassEncoder;
    private currentPipeline: GPURenderPipeline = null;
    private currentMesh: Mesh;

    constructor(
        device: GPUDevice,
        bufferStore: BufferStore,
        pipelineManager: PipelineManager,
        textureStore: TextureStore,
        globalValues: ObjectUniform
    ) {
        super(device, bufferStore, pipelineManager, textureStore, globalValues);
    }

    drawIndexedTriangles(
        mesh: Mesh,
        material: Material,
        pass: GPURenderPassEncoder
    ) {
        if (this.currentMesh == null || this.currentMesh != mesh) {
            this.currentMesh = mesh;
            this.pipelineManager.bindVertexBuffers(mesh, material, pass);
        }

        pass.drawIndexed(mesh.indexCount);
    }

    draw(mesh: Mesh, material: Material, pass: GPURenderPassEncoder) {
        if (material.primitive === Primitive.Triangles) {
            this.drawIndexedTriangles(mesh, material, pass);
        } else {
            switch (material.primitive) {
                case Primitive.WireTriangles:
                    const triangleCount = mesh.indexCount / 3;
                    pass.draw(6 * triangleCount);
                    break;
                case Primitive.Quads:
                    pass.draw(6 * mesh.vertexCount);
                case Primitive.Lines:
                    const lineCount = mesh.indexCount / 2;
                    pass.draw(6 * lineCount);
                    break;
            }
        }
    }

    renderMesh(meshObject: MeshObject, pass: GPURenderPassEncoder) {
        const material = meshObject.material;
        const mesh = meshObject.mesh;

        const pipeline = this.pipelineManager.getPipeline(material, mesh);
        if (this.currentPipeline == null || pipeline != this.currentPipeline) {
            pass.setPipeline(pipeline);
            this.currentPipeline = pipeline;
        }

        const layout = material.layout;
        if (layout.hasBindGroup(BindGroup.MaterialUniforms)) {
            this.pipelineManager.bindPerMaterialUniforms(material, pass);
        }
        if (layout.hasBindGroup(BindGroup.ObjectUniforms)) {
            this.pipelineManager.bindPerObjectUniforms(pass, material, meshObject);
        }
        if (layout.hasBindGroup(BindGroup.VertexBufferUniforms)) {
            this.pipelineManager.bindVertexBufferUniforms(
                this.currentPipeline,
                mesh,
                material,
                pass
            );
        }

        this.draw(mesh, material, pass);
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
        this.currentMesh = null;
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
