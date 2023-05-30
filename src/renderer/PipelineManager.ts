import { BindGroups, VertexBufferSlot } from "../constants";
import Material from "../materials/Material";
import LayoutInfo from '../materials/LayoutInfo';
import UniformType from "../materials/UniformType";
import TextureStore from "./TextureStore";
import BufferStore from "./BufferStore";
import GlobalUniforms from './GlobalUniforms';
import Container from "../Container";

class PipelineManager implements Service {
    readonly type: string = 'PipelineManager';

    private readonly device: GPUDevice;
    private readonly modules: Map<number, GPUShaderModule>;
    private readonly pipelines: Map<number, GPURenderPipeline>;
    private readonly layouts: Map<string, GPUBindGroupLayout>;
    private readonly bindGroups: Map<object, GPUBindGroup>;
    private readonly globalUniformLayout: GPUBindGroupLayout;
    private readonly textureStore: TextureStore;
    private readonly bufferStore: BufferStore;

    constructor(device: GPUDevice, container: Container) {
        this.device = device;
        this.modules = new Map<number, GPUShaderModule>();
        this.pipelines = new Map();
        this.layouts = new Map();
        this.bindGroups = new Map();
        this.textureStore = container.get<TextureStore>('TextureStore');
        this.bufferStore = container.get<BufferStore>('BufferStore');

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

    private createShaderModule(id: number, code: string) {
        const shaderModule = this.device.createShaderModule({
            label: `${id}`,
            code,
        });

        this.modules.set(id, shaderModule);
    }

    private getShaderModule(material: Material) {
        let shaderModule = this.modules.get(material.id);
        if (!shaderModule) {
            this.createShaderModule(material.id, material.shaderCode);
            shaderModule = this.modules.get(material.id);
        }
        return shaderModule;
    }

    getBindGroupLayoutEntry(info: LayoutInfo): GPUBindGroupLayoutEntry {
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

    private getMaterialLayout(material: Material): GPUBindGroupLayout {
        const typeId = material.typeId;
        if (this.layouts.has(typeId)) {
            return this.layouts.get(typeId);
        }
        const entries = Array(material.layout.length);

        for (let i = 0; i < entries.length; i++) {
            const element = material.layout[i];
            entries[i] = this.getBindGroupLayoutEntry(element);
        }

        const layout = this.device.createBindGroupLayout({
            label: 'object uniforms BindGroupLayout',
            entries,
        });

        this.layouts.set(typeId, layout);

        return layout;
    }

    bindGlobalUniforms(pass: GPURenderPassEncoder, globalUniforms: GlobalUniforms) {
        const gpuBuffer = this.bufferStore.getOrCreateUniformBuffer(globalUniforms, 'GlobalUniforms');

        let bindGroup;
        if (!this.bindGroups.has(globalUniforms)) {
            bindGroup = this.device.createBindGroup({
                label: 'global uniforms BindGroup',
                layout: this.globalUniformLayout,
                entries: [
                    { binding: 0, resource: { buffer: gpuBuffer } },
                ]
            });
        } else {
            bindGroup = this.bindGroups.get(globalUniforms);
        }

        pass.setBindGroup(BindGroups.GlobalUniforms, bindGroup);
    }

    getBindGroupEntries(material: Material, binding: number, entries: GPUBindGroupEntry[]) {
        const info = material.layout[binding];
        const slot = info.slot;
        switch (info.type) {
            case UniformType.Texture: {
                const uniform = material.getTextureUniform(slot);
                const { view, sampler } = this.textureStore.getTexture(uniform.texture);
                entries.push({ binding: slot, resource: view });
                entries.push({ binding: slot + 1, resource: sampler });
                break;
            }
            case UniformType.Buffer: {
                const uniform = material.getBufferUniforms(slot);
                const gpuBuffer = this.bufferStore.getOrCreateUniformBuffer(uniform);
                entries.push({ binding: slot, resource: { buffer: gpuBuffer } });
            }
        }
    }

    bindPipeline(pipeline: GPURenderPipeline, material: Material, pass: GPURenderPassEncoder) {
        const entries: GPUBindGroupEntry[] = [];

        for (let i = 0; i < material.layout.length; i++) {
            this.getBindGroupEntries(material, i, entries);
            // TODO
            // switch (info.type) {
            //     case UniformType.Texture: {
            //         const uniform = material.getTextureUniform(slot);
            //         const { view, sampler } = this.textureStore.getTexture(uniform.texture);
            //         entries.push({ binding: slot, resource: view });
            //         entries.push({ binding: slot + 1, resource: sampler });
            //         break;
            //     }
            //     case UniformType.Buffer: {
            //         const uniform = material.getBufferUniforms(slot);
            //         const gpuBuffer = this.bufferStore.getOrCreateUniformBuffer(uniform);
            //         entries.push({ binding: slot, resource: { buffer: gpuBuffer } });
            //         break;
            //     }
            // }
        }

        const bindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(BindGroups.ObjectUniforms),
            entries,
        });

        pass.setBindGroup(BindGroups.ObjectUniforms, bindGroup);
    }

    onMaterialDestroyed(material: Material) {
        this.pipelines.delete(material.id);
        for (let i = 0; i < material.layout.length; i++) {
            const info = material.layout[i];
            const slot = info.slot;
            switch (info.type) {
                case UniformType.Buffer: {
                    const uniform = material.getBufferUniforms(slot);
                    this.bufferStore.destroyUniformBuffer(uniform);
                    break;
                }
            }
        }
    }

    getPipeline(material: Material): GPURenderPipeline {
        if (this.pipelines.has(material.id)) {
            return this.pipelines.get(material.id);
        }

        material.on('destroy', (evt) => this.onMaterialDestroyed(evt.emitter as Material))

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
