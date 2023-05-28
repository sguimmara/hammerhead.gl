import chroma from "chroma-js";
import Material from "./materials/Material";
import Mesh from "./objects/Mesh";
import ShaderStore from './ShaderStore';
import RenderSceneStage from "./pipelines/RenderSceneStage";
import BufferStore from "./BufferStore";
import { VertexBufferSlot } from "./constants";

const DEFAULT_CLEAR_COLOR = chroma('black');

class WebGPURenderer {
    private shaderStore: ShaderStore;
    private device: GPUDevice;
    private pipelines: Map<number, GPURenderPipeline>;
    private context: GPUCanvasContext;
    private renderPass: RenderSceneStage;
    private bufferStore: BufferStore;

    clearColor: chroma.Color;

    constructor(device: GPUDevice, shaderStore: ShaderStore, context: GPUCanvasContext) {
        this.shaderStore = shaderStore;
        this.device = device;
        this.pipelines = new Map();
        this.context = context;
        this.clearColor = DEFAULT_CLEAR_COLOR;
        this.renderPass = new RenderSceneStage();
        this.bufferStore = new BufferStore(device);
    }

    private getShaderModule(material: Material) {
        let shaderModule = this.shaderStore.get(material.id);
        if (!shaderModule) {
            this.shaderStore.store(material.id, material.shaderCode);
            shaderModule = this.shaderStore.get(material.id);
        }
        return shaderModule;
    }

    private getPipeline(material: Material): GPURenderPipeline {
        if (this.pipelines.has(material.id)) {
            return this.pipelines.get(material.id);
        }

        const shaderModule = this.getShaderModule(material);

        if (!shaderModule) {
            throw new Error(`no shader module found with id ${material.id}`);
        }

        const target: GPUColorTargetState = {
            format: navigator.gpu.getPreferredCanvasFormat(), // TODO save
        };

        const pipeline = this.device.createRenderPipeline({
            label: `pipeline for material ${material.id}`,
            layout: 'auto',
            vertex: {
                module: shaderModule,
                entryPoint: 'vs',
                buffers: [
                    {
                        arrayStride: 3 * 4,
                        attributes: [
                            { shaderLocation: VertexBufferSlot.Vertex, offset: 0, format: 'float32x3' }, // position
                        ]
                    },
                    {
                        arrayStride: 2 * 4,
                        attributes: [
                            { shaderLocation: VertexBufferSlot.TexCoord, offset: 0, format: 'float32x2' } // texcoord
                        ]
                    }
                ]
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fs',
                targets: [target]
            }
        });

        this.pipelines.set(material.id, pipeline);

        return pipeline;
    }

    renderMesh(mesh: Mesh, pass: GPURenderPassEncoder) {
        const material = mesh.material;
        const geometry = mesh.geometry;

        pass.setPipeline(this.getPipeline(material));

        const vertices = this.bufferStore.getVertexBuffer(geometry, VertexBufferSlot.Vertex);
        pass.setVertexBuffer(VertexBufferSlot.Vertex, vertices);
        const texcoord = this.bufferStore.getVertexBuffer(geometry, VertexBufferSlot.TexCoord);
        if (texcoord) {
            pass.setVertexBuffer(VertexBufferSlot.TexCoord, texcoord);
        }
        pass.setIndexBuffer(this.bufferStore.getIndexBuffer(geometry), "uint16");

        pass.drawIndexed(geometry.indexCount);
    }

    render(list : Iterable<Mesh>) {
        const encoder = this.device.createCommandEncoder();

        const scenePass = this.renderPass
            .withColorTarget(this.context.getCurrentTexture())
            .withClearColor(this.clearColor)
            .begin(encoder);

        for (const mesh of list) {
            this.renderMesh(mesh, scenePass.getPass());
        }

        scenePass.finish();

        const commandBuffer = encoder.finish();

        this.device.queue.submit([commandBuffer]);
    }

}

export default WebGPURenderer;