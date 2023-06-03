import { mat4, vec3, vec4 } from "wgpu-matrix";
import Container from "../core/Container";
import Service from "../core/Service";
import { BindGroups } from "../core/constants";
import BufferGeometry from "../geometries/BufferGeometry";
import Material from "../materials/Material";
import { UniformType, UniformInfo, AttributeInfo, AttributeType } from "../materials/ShaderLayout";
import Mat4Uniform from "../materials/uniforms/Mat4Uniform";
import ObjectUniform from "../materials/uniforms/ObjectUniform";
import BufferStore from "./BufferStore";
import TextureStore from "./TextureStore";
import Mesh from "../objects/Mesh";

class PerObject {
    transformUniform: ObjectUniform;
    worldMatrixBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
}

class PerMaterial {
    material: Material;
    shaderModule: GPUShaderModule;
    pipeline: GPURenderPipeline;
    bindGroup: GPUBindGroup;
}

class PipelineManager implements Service {
    readonly type: string = 'PipelineManager';

    private readonly device: GPUDevice;
    private readonly layouts: Map<string, GPUBindGroupLayout>;
    private readonly perObjectMap: Map<number, PerObject>;
    private readonly perMaterialMap: Map<number, PerMaterial>;
    private globalUniformBindGroup: GPUBindGroup;
    private readonly globalUniformLayout: GPUBindGroupLayout;
    private readonly objectUniformLayout: GPUBindGroupLayout;
    private readonly textureStore: TextureStore;
    private readonly bufferStore: BufferStore;

    constructor(device: GPUDevice, container: Container) {
        this.device = device;
        this.layouts = new Map();
        this.perObjectMap = new Map();
        this.perMaterialMap = new Map();
        this.textureStore = container.get<TextureStore>('TextureStore');
        this.bufferStore = container.get<BufferStore>('BufferStore');

        this.globalUniformLayout = device.createBindGroupLayout({
            label: 'global uniforms BindGroupLayout',
            entries: [
                { binding: 0, visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX, buffer: {} },
            ]
        });

        this.objectUniformLayout = device.createBindGroupLayout({
            label: 'worldMatrix BindGroupLayout',
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} }
            ]
        });
    }

    destroy() {
        this.perObjectMap.forEach(o => {
            this.bufferStore.destroyUniformBuffer(o.transformUniform);
        });

        this.perMaterialMap.forEach(o => {
            o.material.getBufferUniforms().forEach(u => {
                this.bufferStore.destroyUniformBuffer(u);
            })
        });

        this.perMaterialMap.clear();
        this.perObjectMap.clear();
    }

    private createShaderModule(id: number, code: string) {
        return this.device.createShaderModule({
            label: `${id}`,
            code,
        });
    }

    private onMeshDestroyed(mesh: Mesh) {
        const perObject = this.perObjectMap.get(mesh.id);

        if (perObject) {
            this.bufferStore.destroyUniformBuffer(perObject.transformUniform);
            this.perMaterialMap.delete(mesh.id);
        }
    }

    private onMaterialDestroyed(material: Material) {
        this.perMaterialMap.delete(material.id);
        const uniforms = material.layout.uniforms;
        for (let i = 0; i < uniforms.length; i++) {
            const info = uniforms[i];
            const slot = info.binding;
            switch (info.type) {
                case UniformType.Scalar:
                case UniformType.Vec2:
                case UniformType.Vec3:
                case UniformType.Vec4: {
                    const uniform = material.getBufferUniform(slot);
                    this.bufferStore.destroyUniformBuffer(uniform);
                    break;
                }
            }
        }
    }

    getBindGroupLayoutEntry(uniform: UniformInfo): GPUBindGroupLayoutEntry {
        switch (uniform.type) {
            case UniformType.Texture2D:
                return { binding: uniform.binding, visibility: GPUShaderStage.FRAGMENT, texture: {} }
            case UniformType.Sampler:
                return { binding: uniform.binding, visibility: GPUShaderStage.FRAGMENT, sampler: {} }
            case UniformType.Scalar:
            case UniformType.Vec2:
            case UniformType.Vec3:
            case UniformType.Vec4:
            case UniformType.GlobalValues:
                return { binding: uniform.binding, visibility: GPUShaderStage.FRAGMENT, buffer: {} }
            default:
                throw new Error('unsupported uniform type');
        }
    }

    private getMaterialLayout(material: Material): GPUBindGroupLayout {
        const key = material.shaderCode;
        if (this.layouts.has(key)) {
            return this.layouts.get(key);
        }
        const uniforms = material.layout.uniforms;
        const entries = Array(uniforms.length);

        for (let i = 0; i < entries.length; i++) {
            const element = uniforms[i];
            entries[i] = this.getBindGroupLayoutEntry(element);
        }

        const layout = this.device.createBindGroupLayout({
            label: 'object uniforms BindGroupLayout',
            entries,
        });

        this.layouts.set(key, layout);

        return layout;
    }

    bindPerObjectUniforms(pass: GPURenderPassEncoder, mesh: Mesh) {
        let perObject = this.perObjectMap.get(mesh.id);
        if (!perObject) {
            perObject = new PerObject();
            perObject.transformUniform = new ObjectUniform(mesh.transform);
            perObject.worldMatrixBuffer = this.bufferStore.getOrCreateUniformBuffer(perObject.transformUniform, 'worldMatrix');
            perObject.bindGroup = this.device.createBindGroup({
                label: 'worldMatrix BindGroup',
                layout: this.objectUniformLayout,
                entries: [
                    { binding: 0, resource: { buffer: perObject.worldMatrixBuffer } },
                ]
            });
            this.perObjectMap.set(mesh.id, perObject);

            mesh.on('destroy', () => this.onMeshDestroyed(mesh));
        } else {
            this.bufferStore.updateUniform(perObject.transformUniform);
        }

        pass.setBindGroup(BindGroups.ObjectUniforms, perObject.bindGroup);
    }

    bindGlobalUniforms(pass: GPURenderPassEncoder, GlobalValues: ObjectUniform) {
        const gpuBuffer = this.bufferStore.getOrCreateUniformBuffer(GlobalValues, 'GlobalValues');

        if (!this.globalUniformBindGroup) {
            this.globalUniformBindGroup = this.device.createBindGroup({
                label: 'global uniforms BindGroup',
                layout: this.globalUniformLayout,
                entries: [
                    { binding: 0, resource: { buffer: gpuBuffer } },
                ]
            });
        }

        pass.setBindGroup(BindGroups.GlobalValues, this.globalUniformBindGroup);
    }

    getBindGroupEntries(material: Material, binding: number, entries: GPUBindGroupEntry[]) {
        const uniforms = material.layout.uniforms;
        const info = uniforms[binding];
        const slot = info.binding;
        switch (info.type) {
            case UniformType.Texture2D: {
                const uniform = material.getTexture(slot);
                const { defaultView } = this.textureStore.getOrCreateTexture(uniform.value);
                entries.push({ binding: slot, resource: defaultView });
                break;
            }
            case UniformType.Sampler:
                const uniform = material.getSampler(slot);
                const sampler = this.textureStore.getOrCreateSampler(uniform.value);
                entries.push({ binding: slot, resource: sampler });
                break;
            case UniformType.Scalar:
            case UniformType.Vec2:
            case UniformType.Vec3:
            case UniformType.Vec4: {
                const uniform = material.getBufferUniform(slot);
                const gpuBuffer = this.bufferStore.getOrCreateUniformBuffer(uniform);
                entries.push({ binding: slot, resource: { buffer: gpuBuffer } });
            }
        }
    }

    bindPerMaterialUniforms(material: Material, pass: GPURenderPassEncoder) {
        const perMaterial = this.perMaterialMap.get(material.id);

        material.getBufferUniforms().forEach(u => this.bufferStore.updateUniform(u));

        pass.setBindGroup(BindGroups.MaterialUniforms, perMaterial.bindGroup);
    }

    private getVertexBufferLayout(info: AttributeInfo): GPUVertexBufferLayout {
        let arrayStride;
        const shaderLocation = info.location;
        let format: GPUVertexFormat;
        switch (info.type) {
            case AttributeType.Vec2:
                arrayStride = 2 * 4;
                format = 'float32x2'
                break;
            case AttributeType.Vec3:
                arrayStride = 3 * 4;
                format = 'float32x3';
                break;
            case AttributeType.Vec4:
                arrayStride = 4 * 4;
                format = 'float32x4';
                break;
        }

        return {
            arrayStride,
            attributes: [{ shaderLocation, offset: 0, format }]
        };
    }

    bindVertexBuffers(geometry: BufferGeometry, pass: GPURenderPassEncoder) {
        for (const key of geometry.vertexBuffers.keys()) {
            const gpuBuffer = this.bufferStore.getOrCreateVertexBuffer(geometry, key);
            pass.setVertexBuffer(key, gpuBuffer);
        }
        const format = geometry.indexBuffer instanceof Uint32Array ? "uint32" : "uint16";
        pass.setIndexBuffer(this.bufferStore.getIndexBuffer(geometry), format);
    }

    getPipeline(material: Material): GPURenderPipeline {
        let perMaterial = this.perMaterialMap.get(material.id);
        if (!perMaterial) {
            perMaterial = new PerMaterial();
            perMaterial.material = material;
            perMaterial.shaderModule = this.createShaderModule(material.id, material.shaderCode);

            // TODO get blending mode from material.
            const colorTarget: GPUColorTargetState = {
                format: navigator.gpu.getPreferredCanvasFormat(),
                blend: {
                    color: {
                        operation: 'add',
                        srcFactor: 'src-alpha',
                        dstFactor: 'one-minus-src-alpha'
                    },
                    alpha: {
                        operation: 'subtract',
                        srcFactor: 'src-alpha',
                        dstFactor: 'one-minus-src-alpha'
                    }
                }
            };

            // TODO refactor
            const bindGroupLayouts = material.requiresObjectUniforms
                ? [
                    this.globalUniformLayout,
                    this.getMaterialLayout(material),
                    this.objectUniformLayout,
                ]
                :
                [
                    this.globalUniformLayout,
                    this.getMaterialLayout(material),
                ];


            const layout = this.device.createPipelineLayout({
                bindGroupLayouts
            });

            const attributes = material.layout.attributes;
            const buffers = attributes.map(attr => this.getVertexBufferLayout(attr));

            // TODO get depth buffer behaviour from material
            const pipeline = this.device.createRenderPipeline({
                label: `Material ${material.id}`,
                layout,
                depthStencil: {
                    format: 'depth32float', // TODO expose as global config
                    depthWriteEnabled: material.depthWriteEnabled,
                    depthCompare: "less-equal" // TODO get from material
                },
                primitive: {
                    topology: 'triangle-list', // TODO get from geometry
                    frontFace: 'cw', // TODO get from geometry
                    cullMode: 'back', // TODO get from geometry
                },
                vertex: {
                    module: perMaterial.shaderModule,
                    entryPoint: 'vs',
                    buffers
                },
                fragment: {
                    module: perMaterial.shaderModule,
                    entryPoint: 'fs',
                    targets: [colorTarget]
                }
            });

            perMaterial.pipeline = pipeline;

            const entries: GPUBindGroupEntry[] = [];

            const uniforms = material.layout.uniforms;
            for (let i = 0; i < uniforms.length; i++) {
                this.getBindGroupEntries(material, i, entries);
            }

            const bindGroup = this.device.createBindGroup({
                layout: pipeline.getBindGroupLayout(BindGroups.MaterialUniforms),
                entries,
            });

            perMaterial.bindGroup = bindGroup;

            this.perMaterialMap.set(material.id, perMaterial);

            material.on('destroy', (evt) => this.onMaterialDestroyed(evt.emitter as Material))
        }

        return perMaterial.pipeline;
    }
}

export default PipelineManager;
