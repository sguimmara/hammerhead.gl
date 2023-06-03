import Service from "../core/Service";
import { VertexBufferSlot } from "../core/constants";
import BufferGeometry from "../geometries/BufferGeometry";
import BufferUniform from "../materials/uniforms/BufferUniform";
import BufferWriter from "./BufferWriter";

/**
 * Manages GPU buffers.
 */
class BufferStore implements Service {
    readonly type: string = 'BufferStore';

    private readonly device: GPUDevice;
    private readonly indexBuffers: Map<number, GPUBuffer>;
    private readonly vertexBuffers: Map<number, Map<number, GPUBuffer>>;
    private readonly uniformBuffers: Map<BufferUniform, BufferWriter>;

    constructor(device: GPUDevice) {
        this.indexBuffers = new Map();
        this.vertexBuffers = new Map();
        this.uniformBuffers = new Map();
        this.device = device;
    }

    private onGeometryDestroyed(geometry: BufferGeometry): void {
        const vertexBuffers = this.vertexBuffers.get(geometry.id);
        if (vertexBuffers) {
            vertexBuffers.forEach(gpuBuffer => {
                gpuBuffer.destroy();
            });
            this.vertexBuffers.delete(geometry.id);
        }

        const indexBuffer = this.indexBuffers.get(geometry.id);
        if (indexBuffer) {
            indexBuffer.destroy();
            this.indexBuffers.delete(geometry.id);
        }
    }

    getBufferCount() {
        let count = this.uniformBuffers.size + this.indexBuffers.size;

        this.vertexBuffers.forEach(vBuf => count += vBuf.size);

        return count;
    }

    destroy() {
        for (const buf of this.indexBuffers.values()) {
            buf.destroy();
        }

        for (const map of this.vertexBuffers.values()) {
            for (const buf of map.values()) {
                buf.destroy();
            }
        }

        this.indexBuffers.clear();
        this.vertexBuffers.clear();
    }

    destroyBuffers(quad: BufferGeometry) {
        if (this.vertexBuffers.has(quad.id)) {
            const map = this.vertexBuffers.get(quad.id);
            for (const buf of map.values()) {
                buf.destroy()
            }

            this.vertexBuffers.delete(quad.id);
        }
        if (this.indexBuffers.has(quad.id)) {
            this.indexBuffers.get(quad.id).destroy();
            this.indexBuffers.delete(quad.id);
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
        if (!this.vertexBuffers.has(geometry.id)) {
            this.vertexBuffers.set(geometry.id, new Map());
        } else if (this.vertexBuffers.get(geometry.id).has(slot)) {
            return this.vertexBuffers.get(geometry.id).get(slot);
        }

        // TODO will be called multiple times for each buffer
        geometry.on('destroy', evt => this.onGeometryDestroyed(evt.emitter as BufferGeometry));

        const buf = geometry.getVertexBuffer(slot);

        const gpuBuffer = this.device.createBuffer({
            label: `BufferGeometry ${geometry.id} @${VertexBufferSlot[slot]}`,
            size: buf.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.vertexBuffers.get(geometry.id).set(slot, gpuBuffer);

        this.device.queue.writeBuffer(gpuBuffer, 0, buf);

        return gpuBuffer;
    }

    getIndexBuffer(geometry: BufferGeometry): GPUBuffer {
        if (this.indexBuffers.has(geometry.id)) {
            return this.indexBuffers.get(geometry.id);
        }

        const gpuBuffer = this.device.createBuffer({
            label: `BufferGeometry ${geometry.id} @Index`,
            size: geometry.indexBuffer.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        this.indexBuffers.set(geometry.id, gpuBuffer);

        this.device.queue.writeBuffer(gpuBuffer, 0, geometry.indexBuffer);

        return gpuBuffer;
    }
}

export default BufferStore;