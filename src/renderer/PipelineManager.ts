import { BindGroups, Container, Service, Versioned } from '@/core';
import { Mesh } from '@/geometries';
import { AttributeInfo, AttributeType, Material, RenderingMode, UniformInfo, UniformType } from '@/materials';
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
    private readonly layouts: Map<string, GPUBindGroupLayout>;
    private readonly perObjectMap: Map<number, PerObject>;
    private readonly shaderModules: Map<string, GPUShaderModule>;
    private readonly perMaterialMap: Map<number, PerMaterial>;
    private readonly perGeometryMap: Map<number, PerGeometry>;
    private readonly globalUniformLayout: GPUBindGroupLayout;
    private readonly objectUniformLayout: GPUBindGroupLayout;
    private readonly textureStore: TextureStore;
    private readonly bufferStore: BufferStore;
    private readonly vertexUniformLayout: GPUBindGroupLayout;

    constructor(device: GPUDevice, container: Container) {
        this.device = device;
        this.layouts = new Map();
        this.perObjectMap = new Map();
        this.perMaterialMap = new Map();
        this.perGeometryMap = new Map();
        this.shaderModules = new Map();
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

        this.objectUniformLayout = device.createBindGroupLayout({
            label: "worldMatrix",
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} },
            ],
        });

        this.vertexUniformLayout = device.createBindGroupLayout({
            label: "vertex uniforms",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "read-only-storage" },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "read-only-storage" },
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "read-only-storage" },
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "read-only-storage" },
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
            .replaceAll("GLOBAL_UNIFORMS", BindGroups.GlobalValues.toString())
            .replaceAll(
                "MATERIAL_UNIFORMS",
                BindGroups.MaterialUniforms.toString()
            )
            .replaceAll("OBJECT_UNIFORMS", BindGroups.ObjectUniforms.toString())
            .replaceAll(
                "VERTEX_UNIFORMS",
                BindGroups.VertexBufferUniforms.toString()
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
            case UniformType.Float32:
            case UniformType.Vec2:
            case UniformType.Vec3:
            case UniformType.Vec4:
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

    private getMaterialLayout(material: Material): GPUBindGroupLayout {
        const key = material.fragmentShader;
        if (this.layouts.has(key)) {
            return this.layouts.get(key);
        }
        const uniforms = material.layout.uniforms;
        const entries = [];

        for (let i = 0; i < uniforms.length; i++) {
            const element = uniforms[i];
            if (element.group === BindGroups.MaterialUniforms) {
                entries.push(this.getBindGroupLayoutEntry(element));
            }
        }

        const layout = this.device.createBindGroupLayout({
            label: "object uniforms BindGroupLayout",
            entries,
        });

        this.layouts.set(key, layout);

        return layout;
    }

    bindPerObjectUniforms(pass: GPURenderPassEncoder, mesh: MeshObject) {
        let perObject = this.perObjectMap.get(mesh.id);
        if (!perObject) {
            perObject = new PerObject();
            perObject.transformUniform = new ObjectUniform(mesh.transform);
            perObject.worldMatrixBuffer =
                this.bufferStore.getOrCreateUniformBuffer(
                    perObject.transformUniform,
                    "worldMatrix"
                );
            perObject.bindGroup = this.device.createBindGroup({
                label: "worldMatrix BindGroup",
                layout: this.objectUniformLayout,
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: perObject.worldMatrixBuffer },
                    },
                ],
            });
            this.perObjectMap.set(mesh.id, perObject);

            mesh.on("destroy", () => this.onMeshDestroyed(mesh));
        } else {
            this.bufferStore.updateUniform(perObject.transformUniform);
        }

        pass.setBindGroup(BindGroups.ObjectUniforms, perObject.bindGroup);
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

        pass.setBindGroup(BindGroups.GlobalValues, this.globalUniformBindGroup);
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
            BindGroups.MaterialUniforms,
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
            const array = mesh.getAttribute(attribute.name);
            const gpuBuffer = this.bufferStore.getOrCreateVertexBuffer(
                mesh,
                attribute.name
            );
            pass.setVertexBuffer(attribute.location, gpuBuffer, array.byteOffset, array.byteLength);
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
        geometry: Mesh,
        pass: GPURenderPassEncoder
    ) {
        let perGeometry = this.perGeometryMap.get(geometry.id);
        if (!perGeometry) {
            perGeometry = new PerGeometry();
            this.perGeometryMap.set(geometry.id, perGeometry);
        }

        if (!perGeometry.vertexBufferBindGroup) {
            const entries = this.getAttributesAsBindGroupEntries(geometry);
            perGeometry.vertexBufferBindGroup = this.device.createBindGroup({
                layout: pipeline.getBindGroupLayout(
                    BindGroups.VertexBufferUniforms
                ),
                entries,
            });
        }

        pass.setBindGroup(
            BindGroups.VertexBufferUniforms,
            perGeometry.vertexBufferBindGroup
        );
    }

    /**
     * Get a buffer attribute as a bind group entry (instead of a regular attribute).
     * Useful for vertex pulling.
     */
    private getAttributesAsBindGroupEntries(
        geometry: Mesh
    ): GPUBindGroupEntry[] {
        // TODO adapt the collected attributes from the needs of the material
        const posBuffer = this.bufferStore.getOrCreateVertexBuffer(
            geometry,
            "position"
        );
        const colBuffer = this.bufferStore.getOrCreateVertexBuffer(
            geometry,
            "color"
        );
        const uvBuffer = this.bufferStore.getOrCreateVertexBuffer(
            geometry,
            "texcoord"
        );
        const indexBuffer = this.bufferStore.getIndexBuffer(geometry);

        // TODO vertex pulling does not support uint16 indices
        // We need to convert the Uint16Array into an Uint32Array
        // TODO make bindings dynamic from the material layout
        return [
            {
                binding: 0,
                resource: { buffer: posBuffer },
            },
            {
                binding: 1,
                resource: { buffer: uvBuffer },
            },
            {
                binding: 2,
                resource: { buffer: colBuffer },
            },
            {
                binding: 3,
                resource: { buffer: indexBuffer },
            },
        ];
    }

    getPrimitiveState(material: Material, mesh: Mesh): GPUPrimitiveState {
        return {
            topology: mesh.topology,
            frontFace: mesh.frontFace,
            cullMode: material.cullingMode,
        };
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

        const bindGroupLayouts: GPUBindGroupLayout[] = [
            this.globalUniformLayout,
            this.getMaterialLayout(material),
        ];

        if (material.requiresObjectUniforms) {
            bindGroupLayouts.push(this.objectUniformLayout);
        }

        if (material.renderingMode != RenderingMode.Triangles) {
            bindGroupLayouts.push(this.vertexUniformLayout);
        }

        const layout = this.device.createPipelineLayout({
            bindGroupLayouts,
        });

        const attributes = material.layout.attributes;

        let buffers: GPUVertexBufferLayout[] = [];
        if (material.renderingMode === RenderingMode.Triangles) {
            buffers = attributes.map((attr) =>
                this.getVertexBufferLayout(attr)
            );
        }

        const pipeline = this.device.createRenderPipeline({
            label: `Material ${material.id}`,
            layout,
            depthStencil: {
                format: "depth32float", // TODO expose as global config
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
            layout: pipeline.getBindGroupLayout(BindGroups.MaterialUniforms),
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
