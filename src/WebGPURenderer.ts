import chroma, { Color } from "chroma-js";
import Material from "./materials/Material";
import Mesh from "./objects/Mesh";
import ShaderStore from './ShaderStore';
import RenderPass from "./pipelines/RenderPass";
import BufferGeometry from "./geometries/BufferGeometry";

const DEFAULT_CLEAR_COLOR = chroma('black');

class WebGPURenderer {
    private shaderStore: ShaderStore;
    private device: GPUDevice;
    private pipelines: Map<number, GPURenderPipeline>;
    private context: GPUCanvasContext;
    private clearColor: chroma.Color;
    private renderPass: RenderPass;
    private vertexBuffers: Map<number, GPUBuffer>;
    private indexBuffers: Map<number, GPUBuffer>;

    constructor(device: GPUDevice, shaderStore: ShaderStore, context: GPUCanvasContext) {
        this.shaderStore = shaderStore;
        this.device = device;
        this.pipelines = new Map();
        this.context = context;
        this.clearColor = DEFAULT_CLEAR_COLOR;
        this.renderPass = new RenderPass();
        this.vertexBuffers = new Map();
        this.indexBuffers = new Map();
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
                            { shaderLocation: 0, offset: 0, format: 'float32x3' } // position
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

    private getVertexBuffer(geometry: BufferGeometry): GPUBuffer {
        if (this.vertexBuffers.has(geometry.id)) {
            return this.vertexBuffers.get(geometry.id);
        }

        const gpuBuffer = this.device.createBuffer({
            size: geometry.vertexBuffer.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.vertexBuffers.set(geometry.id, gpuBuffer);

        this.device.queue.writeBuffer(gpuBuffer, 0, geometry.vertexBuffer);

        return gpuBuffer;
    }

    private getIndexBuffer(geometry: BufferGeometry): GPUBuffer {
        if (this.indexBuffers.has(geometry.id)) {
            return this.indexBuffers.get(geometry.id);
        }

        const gpuBuffer = this.device.createBuffer({
            size: geometry.indexBuffer.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        this.indexBuffers.set(geometry.id, gpuBuffer);

        this.device.queue.writeBuffer(gpuBuffer, 0, geometry.indexBuffer);

        return gpuBuffer;
    }

    render(list : Iterable<Mesh>) {
        const encoder = this.device.createCommandEncoder();

        const scenePass = this.renderPass
            .withColorTarget(this.context.getCurrentTexture())
            .withClearColor(this.clearColor)
            .begin(encoder);

        const pass = scenePass.pass;

        for (const mesh of list) {
            const material = mesh.material;
            const geometry = mesh.geometry;

            pass.setPipeline(this.getPipeline(material));

            pass.setVertexBuffer(0, this.getVertexBuffer(geometry));
            pass.setIndexBuffer(this.getIndexBuffer(geometry), "uint16");

            pass.drawIndexed(geometry.indexCount);
        }

        scenePass.finish();

        const commandBuffer = encoder.finish();

        this.device.queue.submit([commandBuffer]);
    }

}

export default WebGPURenderer;