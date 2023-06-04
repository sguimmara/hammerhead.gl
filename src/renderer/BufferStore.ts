import Destroy from "../core/Destroy";
import Service from "../core/Service";
import { VertexBufferSlot } from "../core/constants";
import BufferGeometry from "../geometries/BufferGeometry";
import BufferUniform from "../materials/uniforms/BufferUniform";
import BufferWriter from "./BufferWriter";

class GeometryStorage implements Destroy {
    currentVersion: number;
    currentVertexCount: number;
    indexBuffer: GPUBuffer;
    vertexBuffers: Map<number, GPUBuffer>;

    constructor() {
        this.vertexBuffers = new Map();
    }

    destroy(): void {
        this.indexBuffer?.destroy();
        this.vertexBuffers?.forEach(b => b.destroy());
    }

    getBufferCount() {
        let result = 0;
        if (this.indexBuffer) {
            result++;
        }
        if (this.vertexBuffers) {
            result += this.vertexBuffers.size;
        }

        return result;
    }
}

/**
 * Manages GPU buffers.
 */
class BufferStore implements Service {
    readonly type: string = 'BufferStore';

    private readonly device: GPUDevice;
    private readonly geometryStorages: Map<number, GeometryStorage>;
    private readonly uniformBuffers: Map<BufferUniform, BufferWriter>;

    constructor(device: GPUDevice) {
        this.geometryStorages = new Map();
        this.uniformBuffers = new Map();
        this.device = device;
    }

    private onGeometryDestroyed(geometry: BufferGeometry): void {
        const vertexBuffers = this.geometryStorages.get(geometry.id);
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

    destroyBuffers(quad: BufferGeometry) {
        if (this.geometryStorages.has(quad.id)) {
            const storage = this.geometryStorages.get(quad.id);
            storage.destroy();
            this.geometryStorages.delete(quad.id);
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

    getOrCreateVertexBuffer(geometry: BufferGeometry, slot: number): GPUBuffer {
        let storage = this.geometryStorages.get(geometry.id);
        if (!storage) {
            storage = new GeometryStorage();
            geometry.on('destroy', evt => this.onGeometryDestroyed(evt.emitter as BufferGeometry));
            this.geometryStorages.set(geometry.id, storage);
        } else if (storage.vertexBuffers.has(slot)) {
            return storage.vertexBuffers.get(slot);
        }

        // TODO handle version change of geometry

        const buf = geometry.getVertexBuffer(slot);

        const gpuBuffer = this.device.createBuffer({
            label: `BufferGeometry ${geometry.id} @${VertexBufferSlot[slot]}`,
            size: buf.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        storage.vertexBuffers.set(slot, gpuBuffer);

        this.device.queue.writeBuffer(gpuBuffer, 0, buf);

        return gpuBuffer;
    }

    getIndexBuffer(geometry: BufferGeometry): GPUBuffer {
        let storage = this.geometryStorages.get(geometry.id);
        if (!storage) {
            geometry.on('destroy', evt => this.onGeometryDestroyed(evt.emitter as BufferGeometry));
            this.geometryStorages.set(geometry.id, new GeometryStorage());
        } else if (storage.indexBuffer) {
            return storage.indexBuffer;
        }

        const gpuBuffer = this.device.createBuffer({
            label: `BufferGeometry ${geometry.id} @Index`,
            size: geometry.indexBuffer.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.STORAGE | GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        storage.indexBuffer = gpuBuffer;

        this.device.queue.writeBuffer(gpuBuffer, 0, geometry.indexBuffer);

        return gpuBuffer;
    }
}

export default BufferStore;