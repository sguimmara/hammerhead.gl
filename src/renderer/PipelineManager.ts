import { BindGroup, Container, Service, Versioned } from '@/core';
import Configuration from '@/core/Configuration';
import { Attribute, Mesh } from '@/geometries';
import { AttributeInfo, AttributeType, Material, UniformInfo, UniformType } from '@/materials';
import { Primitive } from '@/materials/Material';
import ShaderError from '@/materials/ShaderError';
import { ObjectUniform } from '@/materials/uniforms';
import { BufferStore, TextureStore } from '@/renderer';
import { MeshObject } from '@/scene';

class PerObject {
    transformUniform: ObjectUniform;
    worldMatrixBuffer: GPUBuffer;
    bindGroup: GPUBindGroup;
}

class PerGeometry {
    vertexBufferBindGroup: GPUBindGroup;
}

class PerMaterial {
    material: Versioned<Material>;
    vertexShader: GPUShaderModule;
    fragmentShader: GPUShaderModule;
    pipeline: GPURenderPipeline;
    materialBindGroup: GPUBindGroup;
}

/**
 * Manages WebGPU render pipelines and related objects.
 */
class PipelineManager implements Service {
    private globalUniformBindGroup: GPUBindGroup;
    private readonly device: GPUDevice;
    private readonly layouts: Map<number, Map<BindGroup, GPUBindGroupLayout>>;
    private readonly perObjectMap: Map<number, PerObject>;
    private readonly shaderModules: Map<string, GPUShaderModule>;
    private readonly perMaterialMap: Map<number, PerMaterial>;
    private readonly perGeometryMap: Map<number, PerGeometry>;
    private readonly globalUniformLayout: GPUBindGroupLayout;
    private readonly textureStore: TextureStore;
    private readonly bufferStore: BufferStore;
    private readonly configuration: Configuration;

    constructor(device: GPUDevice, container: Container) {
        this.device = device;
        this.layouts = new Map();
        this.perObjectMap = new Map();
        this.perMaterialMap = new Map();
        this.perGeometryMap = new Map();
        this.shaderModules = new Map();
        this.configuration = container.get<Configuration>("Configuration");
        this.textureStore = container.get<TextureStore>("TextureStore");
        this.bufferStore = container.get<BufferStore>("BufferStore");

        this.globalUniformLayout = device.createBindGroupLayout({
            label: "global uniforms",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
                    buffer: {},
                },
            ],
        });
    }

    getType(): string {
        return "PipelineManager";
    }

    destroy() {
        this.perObjectMap.forEach((o) => {
            this.bufferStore.destroyUniformBuffer(o.transformUniform);
        });

        this.perMaterialMap.forEach((o) => {
            o.material.value.getBufferUniforms().forEach((u) => {
                this.bufferStore.destroyUniformBuffer(u);
            });
        });

        this.perMaterialMap.clear();
        this.perObjectMap.clear();
    }

    private preprocessShader(shaderCode: string): string {
        // Linux implementation refuses constants as group numbers
        // and require literals.
        return shaderCode
            .replaceAll("GLOBAL_UNIFORMS", BindGroup.GlobalValues.toString())
            .replaceAll(
                "MATERIAL_UNIFORMS",
                BindGroup.MaterialUniforms.toString()
            )
            .replaceAll("OBJECT_UNIFORMS", BindGroup.ObjectUniforms.toString())
            .replaceAll(
                "VERTEX_UNIFORMS",
                BindGroup.VertexBufferUniforms.toString()
            );
    }

    private createShaderModule(code: string) {
        let shaderModule = this.shaderModules.get(code);
        if (!shaderModule) {
            shaderModule = this.device.createShaderModule({
                code: this.preprocessShader(code),
            });
            this.shaderModules.set(code, shaderModule);
        }
        return shaderModule;
    }

    private onMeshDestroyed(mesh: MeshObject) {
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
                case UniformType.Float32:
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

    getVisibility(uniform: UniformInfo): number {
        return (
            (uniform.presentInVertexShader ? GPUShaderStage.VERTEX : 0) |
            (uniform.presentInFragmentShader ? GPUShaderStage.FRAGMENT : 0)
        );
    }

    getBindGroupLayoutEntry(uniform: UniformInfo): GPUBindGroupLayoutEntry {
        const visibility = this.getVisibility(uniform);

        switch (uniform.type) {
            case UniformType.Texture2D:
                return {
                    binding: uniform.binding,
                    visibility,
                    texture: {},
                };
            case UniformType.Sampler:
                return {
                    binding: uniform.binding,
                    visibility,
                    sampler: {},
                };
            case UniformType.U32Array:
            case UniformType.F32Array:
                return {
                    // TODO parse the storage type from the shader
                    binding: uniform.binding,
                    visibility,
                    buffer: { type: "read-only-storage" },
                };
            case UniformType.Float32:
            case UniformType.Vec2:
            case UniformType.Vec3:
            case UniformType.Vec4:
            case UniformType.Mat4:
            case UniformType.GlobalValues:
                return {
                    binding: uniform.binding,
                    visibility,
                    buffer: {},
                };
            default:
                throw new Error("unsupported uniform type");
        }
    }

    private getBindGroupLayout(material: Material, group: BindGroup): GPUBindGroupLayout {
        let cache = this.layouts.get(material.id);
        if (cache) {
            const cachedLayout = cache.get(group);
            if (cachedLayout) {
                return cachedLayout;
            }
        } else {
            cache = new Map();
            this.layouts.set(material.id, cache);
        }
        const uniforms = material.layout.uniforms;
        const entries = [];

        for (let i = 0; i < uniforms.length; i++) {
            const element = uniforms[i];
            if (element.group === group) {
                entries.push(this.getBindGroupLayoutEntry(element));
            }
        }

        const layout = this.device.createBindGroupLayout({
            entries,
        });

        cache.set(group, layout);

        return layout;
    }

    bindPerObjectUniforms(pass: GPURenderPassEncoder, material: Material, mesh: MeshObject) {
        let perObject = this.perObjectMap.get(mesh.id);
        const layout = this.layouts.get(material.id).get(BindGroup.ObjectUniforms);
        if (!perObject) {
            perObject = new PerObject();
            perObject.transformUniform = new ObjectUniform(mesh.transform);
            perObject.worldMatrixBuffer =
                this.bufferStore.getOrCreateUniformBuffer(
                    perObject.transformUniform,
                    "modelMatrix"
                );
            perObject.bindGroup = this.device.createBindGroup({
                label: "modelMatrix BindGroup",
                layout,
                entries: [
                    {
                        binding: material.layout.getUniformBinding('modelMatrix'),
                        resource: { buffer: perObject.worldMatrixBuffer },
                    },
                ],
            });
            this.perObjectMap.set(mesh.id, perObject);

            mesh.on("destroy", () => this.onMeshDestroyed(mesh));
        } else {
            this.bufferStore.updateUniform(perObject.transformUniform);
        }

        pass.setBindGroup(BindGroup.ObjectUniforms, perObject.bindGroup);
    }

    bindGlobalUniforms(
        pass: GPURenderPassEncoder,
        GlobalValues: ObjectUniform
    ) {
        const gpuBuffer = this.bufferStore.getOrCreateUniformBuffer(
            GlobalValues,
            "GlobalValues"
        );

        if (!this.globalUniformBindGroup) {
            this.globalUniformBindGroup = this.device.createBindGroup({
                label: "global uniforms BindGroup",
                layout: this.globalUniformLayout,
                entries: [{ binding: 0, resource: { buffer: gpuBuffer } }],
            });
        }

        pass.setBindGroup(BindGroup.GlobalValues, this.globalUniformBindGroup);
    }

    getBindGroupEntries(
        material: Material,
        binding: number,
        entries: GPUBindGroupEntry[]
    ) {
        const uniforms = material.layout.uniforms;
        const info = uniforms[binding];
        const slot = info.binding;
        switch (info.type) {
            case UniformType.Texture2D: {
                const uniform = material.getTexture(slot);
                const { defaultView } = this.textureStore.getOrCreateTexture(
                    uniform.value
                );
                entries.push({ binding: slot, resource: defaultView });
                break;
            }
            case UniformType.Sampler:
                const uniform = material.getSampler(slot);
                const sampler = this.textureStore.getOrCreateSampler(
                    uniform.value
                );
                entries.push({ binding: slot, resource: sampler });
                break;
            case UniformType.Float32:
            case UniformType.Vec2:
            case UniformType.Vec3:
            case UniformType.Vec4: {
                const uniform = material.getBufferUniform(slot);
                const gpuBuffer =
                    this.bufferStore.getOrCreateUniformBuffer(uniform);
                entries.push({
                    binding: slot,
                    resource: { buffer: gpuBuffer },
                });
            }
        }
    }

    bindPerMaterialUniforms(material: Material, pass: GPURenderPassEncoder) {
        const perMaterial = this.perMaterialMap.get(material.id);

        material
            .getBufferUniforms()
            .forEach((u) => this.bufferStore.updateUniform(u));

        pass.setBindGroup(
            BindGroup.MaterialUniforms,
            perMaterial.materialBindGroup
        );
    }

    private getVertexBufferLayout(info: AttributeInfo): GPUVertexBufferLayout {
        let arrayStride;
        const shaderLocation = info.location;
        let format: GPUVertexFormat;
        switch (info.type) {
            case AttributeType.Vec2:
                arrayStride = 2 * 4;
                format = "float32x2";
                break;
            case AttributeType.Vec3:
                arrayStride = 3 * 4;
                format = "float32x3";
                break;
            case AttributeType.Vec4:
                arrayStride = 4 * 4;
                format = "float32x4";
                break;
        }

        return {
            arrayStride,
            attributes: [{ shaderLocation, offset: 0, format }],
        };
    }

    bindVertexBuffers(
        mesh: Mesh,
        material: Material,
        pass: GPURenderPassEncoder
    ) {
        const attributes = material.layout.attributes;
        for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            const attr = mesh.getAttribute(attribute.name);
            const dst = this.bufferStore.getOrCreateVertexBuffer(
                mesh,
                attribute.name
            );
            const src = attr.value;
            pass.setVertexBuffer(attribute.location, dst, src.byteOffset, src.byteLength);
        }
        const indexBuffer = mesh.getIndices();
        pass.setIndexBuffer(
            this.bufferStore.getIndexBuffer(mesh),
            mesh.indexFormat,
            indexBuffer.byteOffset,
            indexBuffer.byteLength
        );
    }

    bindVertexBufferUniforms(
        pipeline: GPURenderPipeline,
        mesh: Mesh,
        material: Material,
        pass: GPURenderPassEncoder
    ) {
        let perGeometry = this.perGeometryMap.get(mesh.id);
        if (!perGeometry) {
            perGeometry = new PerGeometry();
            this.perGeometryMap.set(mesh.id, perGeometry);
        }

        if (!perGeometry.vertexBufferBindGroup) {
            const entries = this.getAttributesAsBindGroupEntries(mesh, material);
            perGeometry.vertexBufferBindGroup = this.device.createBindGroup({
                layout: pipeline.getBindGroupLayout(
                    BindGroup.VertexBufferUniforms
                ),
                entries,
            });
        }

        pass.setBindGroup(
            BindGroup.VertexBufferUniforms,
            perGeometry.vertexBufferBindGroup
        );
    }

    private getAttributeFromVertexPullingUniform(name: string): Attribute {
        switch (name) {
            case 'vertexPosition': return 'position';
            case 'vertexColor': return 'color';
            case 'vertexTexcoord': return 'texcoord';
            case 'vertexNormal': return 'normal';
            default:
                throw new ShaderError(`invalid vertex uniform: ${name}`);
        }
    }
    /**
     * Get a buffer attribute as a bind group entry (instead of a regular attribute).
     * Useful for vertex pulling.
     */
    private getAttributesAsBindGroupEntries(
        mesh: Mesh,
        material: Material,
    ): GPUBindGroupEntry[] {
        const result : GPUBindGroupEntry[] = [];
        const layout = material.layout;
        const uniforms = layout.getBindGroup(BindGroup.VertexBufferUniforms);
        for (const uniform of uniforms) {
            let entry;
            if (uniform.name === 'indices') {
                // TODO uniform buffers do not support u16 arrays, which
                // forces us to expand u16 index buffers into u32 buffers.
                const buffer = this.bufferStore.getIndexBuffer(mesh);
                entry = {
                    binding: uniform.binding,
                    resource: { buffer },
                }
            } else {
                const attribute = this.getAttributeFromVertexPullingUniform(uniform.name);
                const buffer = this.bufferStore.getOrCreateVertexBuffer(mesh, attribute);
                entry = {
                    binding: uniform.binding,
                    resource: { buffer },
                }
            }
            result.push(entry);
        }

        return result;


    }

    getPrimitiveState(material: Material, mesh: Mesh): GPUPrimitiveState {
        let topology : GPUPrimitiveTopology;
        switch (material.primitive) {
            case Primitive.Triangles:
                topology = mesh.topology;
                break;
            case Primitive.Quads:
                topology = 'triangle-list';
                break;
            case Primitive.WireTriangles:
            case Primitive.Lines:
                topology = 'line-list';
                break;
        }

        return {
            topology: topology,
            frontFace: mesh.frontFace,
            cullMode: material.cullingMode,
        };
    }

    getPipelineLayout(material: Material): GPUPipelineLayout {
        const bindGroupLayouts: GPUBindGroupLayout[] = [];

        if (material.layout.hasBindGroup(BindGroup.GlobalValues)) {
          bindGroupLayouts.push(this.globalUniformLayout);
        }
        if (material.layout.hasBindGroup(BindGroup.MaterialUniforms)) {
            bindGroupLayouts.push(this.getBindGroupLayout(material, BindGroup.MaterialUniforms));
        }
        if (material.layout.hasBindGroup(BindGroup.ObjectUniforms)) {
            bindGroupLayouts.push(this.getBindGroupLayout(material, BindGroup.ObjectUniforms));
        }
        if (material.layout.hasBindGroup(BindGroup.VertexBufferUniforms)) {
            bindGroupLayouts.push(this.getBindGroupLayout(material, BindGroup.VertexBufferUniforms));
        }

        const layout = this.device.createPipelineLayout({
            bindGroupLayouts,
            label: `Material ${material.id}`
        });

        return layout;
    }

    updatePipeline(perMaterial: PerMaterial, mesh: Mesh) {
        const material = perMaterial.material.value;
        if (perMaterial.material.getVersion() === material.getVersion()) {
            return;
        }

        perMaterial.material.setVersion(material.getVersion());

        const colorTarget: GPUColorTargetState = {
            format: navigator.gpu.getPreferredCanvasFormat(),
            blend: {
                color: {
                    operation: material.colorBlending.op,
                    srcFactor: material.colorBlending.srcFactor,
                    dstFactor: material.colorBlending.dstFactor,
                },
                alpha: {
                    operation: material.alphaBlending.op,
                    srcFactor: material.alphaBlending.srcFactor,
                    dstFactor: material.alphaBlending.dstFactor,
                },
            },
        };

        const attributes = material.layout.attributes;

        const layout = this.getPipelineLayout(material);

        let buffers: GPUVertexBufferLayout[] = [];
        if (!material.layout.hasBindGroup(BindGroup.VertexBufferUniforms)) {
            buffers = attributes.map((attr) =>
                this.getVertexBufferLayout(attr)
            );
        }

        const pipeline = this.device.createRenderPipeline({
            label: `Material ${material.id}`,
            layout,
            depthStencil: {
                format: this.configuration.depthBufferFormat,
                depthWriteEnabled: material.depthWriteEnabled,
                depthCompare: material.depthCompare,
            },
            primitive: this.getPrimitiveState(material, mesh),
            vertex: {
                module: perMaterial.vertexShader,
                entryPoint: "vs",
                buffers,
            },
            fragment: {
                module: perMaterial.fragmentShader,
                entryPoint: "fs",
                targets: [colorTarget],
            },
        });

        perMaterial.pipeline = pipeline;

        const entries: GPUBindGroupEntry[] = [];

        const uniforms = material.layout.uniforms;
        for (let i = 0; i < uniforms.length; i++) {
            this.getBindGroupEntries(material, i, entries);
        }

        const materialBindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(BindGroup.MaterialUniforms),
            entries,
        });

        perMaterial.materialBindGroup = materialBindGroup;
    }

    getPipeline(material: Material, mesh: Mesh): GPURenderPipeline {
        let perMaterial = this.perMaterialMap.get(material.id);
        // TODO since frontFace is a property of meshes
        // this perMaterial map is now invalid/incomplete, as it only
        // considers the material.
        if (!perMaterial) {
            perMaterial = new PerMaterial();
            perMaterial.material = new Versioned(material);
            perMaterial.material.setVersion(-1);
            perMaterial.vertexShader = this.createShaderModule(
                material.vertexShader
            );
            perMaterial.fragmentShader = this.createShaderModule(
                material.fragmentShader
            );

            this.updatePipeline(perMaterial, mesh);

            this.perMaterialMap.set(material.id, perMaterial);

            material.on("destroy", (evt) =>
                this.onMaterialDestroyed(evt.emitter as Material)
            );
        } else {
            this.updatePipeline(perMaterial, mesh);
        }

        return perMaterial.pipeline;
    }
}

export default PipelineManager;
