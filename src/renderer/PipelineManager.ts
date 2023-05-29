import { VertexBufferSlot } from "../constants";
import Material from "../materials/Material";
import LayoutInfo from '../materials/LayoutInfo';
import UniformType from "../materials/UniformType";

class PipelineManager {
    private readonly device: GPUDevice;
    private readonly modules: Map<number, GPUShaderModule>;
    private readonly pipelines: Map<number, GPURenderPipeline>;
    private readonly layouts: Map<string, GPUBindGroupLayout>;
    readonly globalUniformLayout: GPUBindGroupLayout;

    constructor(device: GPUDevice) {
        this.device = device;
        this.modules = new Map<number, GPUShaderModule>();
        this.pipelines = new Map();
        this.layouts = new Map();

        this.globalUniformLayout = device.createBindGroupLayout({
            label: 'global uniforms BindGroupLayout',
            entries: [
                { binding: 0, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX, buffer: {} }
            ]
        });
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

    getMaterialLayout(material: Material): GPUBindGroupLayout {
        const typeId = material.typeId;
        if (this.layouts.has(typeId)) {
            return this.layouts.get(typeId);
        }
        const entries = Array(material.layout.length);

        function getEntry(info: LayoutInfo): GPUBindGroupLayoutEntry {
            switch (info.type) {
                case UniformType.Texture:
                    return { binding: info.slot, visibility: GPUShaderStage.FRAGMENT, texture: {} }
                case UniformType.Sampler:
                    return { binding: info.slot, visibility: GPUShaderStage.FRAGMENT, sampler: {} }
                case UniformType.Buffer:
                    return { binding: info.slot, visibility: GPUShaderStage.FRAGMENT, buffer: {} }
                default:
                    throw new Error('unsupported uniform type');
            }
        }

        for (let i = 0; i < entries.length; i++) {
            const element = material.layout[i];
            entries[i] = getEntry(element);
        }

        const layout = this.device.createBindGroupLayout({
            label: 'object uniforms BindGroupLayout',
            entries,
        });

        this.layouts.set(typeId, layout);

        return layout;
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
            format: navigator.gpu.getPreferredCanvasFormat(),
        };

        const layout = this.device.createPipelineLayout({
            bindGroupLayouts: [
                this.globalUniformLayout,
                this.getMaterialLayout(material),
            ]
        });

        const pipeline = this.device.createRenderPipeline({
            label: `pipeline for material ${material.id}`,
            layout,
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

export default PipelineManager;
