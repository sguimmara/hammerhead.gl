import { VertexBufferSlot } from "../constants";
import Material from "../materials/Material";

class ShaderStore {
    private readonly device: GPUDevice;
    private readonly modules: Map<number, GPUShaderModule>;
    private readonly pipelines: Map<number, GPURenderPipeline>;

    constructor(device: GPUDevice) {
        this.device = device;
        this.modules = new Map<number, GPUShaderModule>();
        this.pipelines = new Map();
    }

    destroy() {
        this.pipelines.clear();
        this.modules.clear();
    }

    store(id: number, code: string) {
        const shaderModule = this.device.createShaderModule({
            label: `${id}`,
            code,
        });

        this.modules.set(id, shaderModule);
    }

    get(id: number): GPUShaderModule {
        return this.modules.get(id);
    }

    private getShaderModule(material: Material) {
        let shaderModule = this.get(material.id);
        if (!shaderModule) {
            this.store(material.id, material.shaderCode);
            shaderModule = this.get(material.id);
        }
        return shaderModule;
    }

    getPipeline(material: Material): GPURenderPipeline {
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
}

export default ShaderStore;
