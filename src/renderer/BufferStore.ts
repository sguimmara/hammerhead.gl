import { Destroy, Service, VertexBufferSlot } from '@/core';
import { Attribute, Mesh } from '@/geometries';
import { BufferUniform } from '@/materials/uniforms';
import BufferWriter from './BufferWriter';

class GeometryStorage implements Destroy {
    currentVersion: number;
    currentVertexCount: number;
    source: Mesh;
    indexBuffer: { version: number, buffer: GPUBuffer };
    attributeBuffers: Map<Attribute, { version: number, buffer: GPUBuffer }>;
    private readonly device: GPUDevice;

    constructor(source: Mesh, device: GPUDevice) {
        this.device = device;
        this.source = source;
        this.attributeBuffers = new Map();
    }

    destroy(): void {
        this.indexBuffer?.buffer.destroy();
        this.attributeBuffers?.forEach(item => item.buffer.destroy());
    }

    update() {
        if (this.indexBuffer.version != this.source.getVersion()) {
            this.device.queue.writeBuffer(this.indexBuffer.buffer, 0, this.source.getIndices());
            this.indexBuffer.version = this.source.getVersion();
        }

        this.attributeBuffers.forEach((value, k) => {
            const attribute = this.source.getAttribute(k);
            if (this.source.getVersion() != value.version) {
                this.device.queue.writeBuffer(value.buffer, 0, attribute);
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

/**
 * Manages WebGPU buffers.
 */
class BufferStore implements Service {
    private readonly device: GPUDevice;
    private readonly geometryStorages: Map<number, GeometryStorage>;
    private readonly uniformBuffers: Map<BufferUniform, BufferWriter>;

    constructor(device: GPUDevice) {
        this.geometryStorages = new Map();
        this.uniformBuffers = new Map();
        this.device = device;
    }

    getType(): string {
        return 'BufferStore';
    }

    private onGeometryDestroyed(mesh: Mesh): void {
        const vertexBuffers = this.geometryStorages.get(mesh.id);
        vertexBuffers?.destroy();
    }

    getBufferCount() {
        let count = this.uniformBuffers.size;

        this.geometryStorages.forEach(o => count += o.getBufferCount());

        return count;
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

    destroyUniformBuffer(uniform: BufferUniform) {
        const bw = this.uniformBuffers.get(uniform);
        if (bw) {
            bw.buffer.destroy();
            this.uniformBuffers.delete(uniform);
        }
    }

    updateUniform(uniform: BufferUniform) {
        const bw = this.uniformBuffers.get(uniform);
        bw.update();
    }

    getOrCreateUniformBuffer(uniform: BufferUniform, label: string = 'uniform buffer') {
        if (this.uniformBuffers.has(uniform)) {
            const bw = this.uniformBuffers.get(uniform);
            bw.update();
            return bw.buffer;
        }

        const gpuBuffer = this.device.createBuffer({
            label,
            size: uniform.getByteSize(),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        const bw = new BufferWriter(uniform, gpuBuffer, this.device);
        bw.update();
        this.uniformBuffers.set(uniform, bw);
        return bw.buffer;
    }

    getOrCreateVertexBuffer(mesh: Mesh, slot: Attribute): GPUBuffer {
        let storage = this.geometryStorages.get(mesh.id);
        if (!storage) {
            storage = new GeometryStorage(mesh, this.device);
            mesh.on('destroy', evt => this.onGeometryDestroyed(evt.emitter as Mesh));
            this.geometryStorages.set(mesh.id, storage);
        } else if (storage.attributeBuffers.has(slot)) {
            storage.update();
            return storage.attributeBuffers.get(slot).buffer;
        }

        const buf = mesh.getAttribute(slot);

        if (!buf) {
            throw new Error(`mesh ${mesh.id} has no attribute '${slot}'`);
        }

        const gpuBuffer = this.device.createBuffer({
            label: `BufferGeometry ${mesh.id} @${slot}`,
            size: buf.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        storage.attributeBuffers.set(slot, { version: mesh.getVersion(), buffer: gpuBuffer });

        this.device.queue.writeBuffer(gpuBuffer, 0, buf);

        return gpuBuffer;
    }

    getIndexBuffer(mesh: Mesh): GPUBuffer {
        let storage = this.geometryStorages.get(mesh.id);
        if (!storage) {
            mesh.on('destroy', evt => this.onGeometryDestroyed(evt.emitter as Mesh));
            this.geometryStorages.set(mesh.id, new GeometryStorage(mesh, this.device));
        } else if (storage.indexBuffer) {
            storage.update();
            return storage.indexBuffer.buffer;
        }

        const gpuBuffer = this.device.createBuffer({
            label: `BufferGeometry ${mesh.id} @index`,
            size: mesh.getIndices().byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.STORAGE | GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        storage.indexBuffer = { buffer: gpuBuffer, version: -1 };
        storage.update();
        return gpuBuffer;
    }
}

export default BufferStore;
