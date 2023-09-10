import { Destroy, Service } from '@/core';
import { Attribute, Mesh } from '@/geometries';
import BufferWriter from './BufferWriter';
import MemoryManager from './MemoryManager';
import { UntypedBufferUniform } from '@/materials/uniforms/BufferUniform';

class GeometryStorage implements Destroy {
    currentVersion: number;
    currentVertexCount: number;
    source: Mesh;
    indexBuffer: { version: number, buffer: GPUBuffer };
    attributeBuffers: Map<Attribute, { version: number, buffer: GPUBuffer }>;

    constructor(source: Mesh) {
        this.source = source;
        this.attributeBuffers = new Map();
    }

    destroy(): void {
        this.indexBuffer?.buffer.destroy();
        this.attributeBuffers?.forEach(item => item.buffer.destroy());
    }

    update(memoryManager: MemoryManager) {
        if (this.indexBuffer.version != this.source.getVersion()) {
            memoryManager.sync(this.source.getIndices(), this.indexBuffer.buffer)
            this.indexBuffer.version = this.source.getVersion();
        }

        this.attributeBuffers.forEach((value, k) => {
            const attribute = this.source.getAttribute(k);
            if (attribute.getVersion() != value.version) {
                memoryManager.sync(attribute.value, value.buffer);
                value.version = this.source.getVersion();
            }
        });
    }

    getBufferCount() {
        let result = 0;
        if (this.indexBuffer) {
            result++;
        }
        if (this.attributeBuffers) {
            result += this.attributeBuffers.size;
        }

        return result;
    }
}

interface Stats {
    get bufferCount(): number;
    get bufferMemoryBytes(): number;
}

/**
 * Manages WebGPU buffers.
 */
class BufferStore implements Service, Stats {
    private readonly device: GPUDevice;
    private readonly geometryStorages: Map<number, GeometryStorage>;
    private readonly uniformBuffers: Map<UntypedBufferUniform, BufferWriter>;
    private readonly memoryManager: MemoryManager;

    constructor(device: GPUDevice, memoryManager: MemoryManager) {
        this.geometryStorages = new Map();
        this.uniformBuffers = new Map();
        this.device = device;
        this.memoryManager = memoryManager;
    }

    get bufferCount(): number {
        return this.getBufferCount();
    }

    get bufferMemoryBytes(): number {
        let result = 0;
        this.uniformBuffers.forEach(v => result += v.buffer.size);
        this.geometryStorages.forEach(v => {
            if (v.indexBuffer?.buffer) {
                result += v.indexBuffer.buffer.size;
            }
            v.attributeBuffers.forEach(v => {
                result += v.buffer.size;
            })
        });

        return result;
    }

    getType(): string {
        return 'BufferStore';
    }

    private onGeometryDestroyed(mesh: Mesh): void {
        const vertexBuffers = this.geometryStorages.get(mesh.id);
        vertexBuffers?.destroy();
    }

    getStats() {
        return this;
    }

    getBufferCount() {
        return this.memoryManager.bufferCount;
    }

    destroy() {
        this.geometryStorages.forEach(b => b.destroy());
        this.geometryStorages.clear();
    }

    destroyBuffers(mesh: Mesh) {
        if (this.geometryStorages.has(mesh.id)) {
            const storage = this.geometryStorages.get(mesh.id);
            storage.destroy();
            this.geometryStorages.delete(mesh.id);
        }
    }

    destroyUniformBuffer(uniform: UntypedBufferUniform) {
        const bw = this.uniformBuffers.get(uniform);
        if (bw) {
            bw.buffer.destroy();
            this.uniformBuffers.delete(uniform);
        }
    }

    updateUniform(uniform: UntypedBufferUniform) {
        const bw = this.uniformBuffers.get(uniform);
        bw.update();
    }

    getOrCreateUniformBuffer(uniform: UntypedBufferUniform, label: string = 'uniform buffer') {
        if (this.uniformBuffers.has(uniform)) {
            const bw = this.uniformBuffers.get(uniform);
            bw.update();
            return bw.buffer;
        }

        const gpuBuffer = this.device.createBuffer({
            label,
            size: uniform.getByteSize(),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.INDEX | GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        const bw = new BufferWriter(uniform, gpuBuffer, this.device);
        bw.update();
        this.uniformBuffers.set(uniform, bw);
        return bw.buffer;
    }

    getOrCreateVertexBuffer(mesh: Mesh, slot: Attribute): GPUBuffer {
        let storage = this.geometryStorages.get(mesh.id);
        if (!storage) {
            storage = new GeometryStorage(mesh);
            mesh.on('destroyed', evt => this.onGeometryDestroyed(evt.source));
            this.geometryStorages.set(mesh.id, storage);
        } else if (storage.attributeBuffers.has(slot)) {
            storage.update(this.memoryManager);
            return storage.attributeBuffers.get(slot).buffer;
        }

        const buf = mesh.getAttribute(slot);

        if (!buf) {
            throw new Error(`mesh ${mesh.id} has no attribute '${slot}'`);
        }

        const gpuBuffer = this.memoryManager.createBuffer(buf.value,
            GPUBufferUsage.UNIFORM | GPUBufferUsage.INDEX | GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            `Mesh ${mesh.id} @${slot}`,
        );

        storage.attributeBuffers.set(slot, { version: buf.getVersion(), buffer: gpuBuffer });

        this.memoryManager.sync(buf.value, gpuBuffer);

        return gpuBuffer;
    }

    getIndexBuffer(mesh: Mesh): GPUBuffer {
        let storage = this.geometryStorages.get(mesh.id);
        if (!storage) {
            mesh.on('destroyed', evt => this.onGeometryDestroyed(evt.source));
            storage = new GeometryStorage(mesh);
            this.geometryStorages.set(mesh.id, storage);
        } else if (storage.indexBuffer) {
            storage.update(this.memoryManager);
            return storage.indexBuffer.buffer;
        }

        const indices = mesh.getIndices();
        const gpuBuffer = this.memoryManager.createBuffer(
            indices,
            GPUBufferUsage.INDEX | GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            `Mesh ${mesh.id} @index`,
        );

        storage.indexBuffer = { buffer: gpuBuffer, version: -1 };
        storage.update(this.memoryManager);
        return gpuBuffer;
    }
}

export default BufferStore;
