import { VertexBufferSlot } from '../constants';
import BufferGeometry from '../geometries/BufferGeometry';
import BufferWriter from './BufferWriter';
import { BufferUniform } from './Uniform';

class BufferStore {
    private device: GPUDevice;
    private indexBuffers: Map<number, GPUBuffer>;
    private vertexBuffers: Map<number, Map<number, GPUBuffer>>;
    private uniformBuffers: Map<BufferUniform, BufferWriter>;

    constructor(device: GPUDevice) {
        this.indexBuffers = new Map();
        this.vertexBuffers = new Map();
        this.uniformBuffers = new Map();
        this.device = device;
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

    getUniformBuffer(uniform: BufferUniform) {
        if (this.uniformBuffers.has(uniform)) {
            const bw = this.uniformBuffers.get(uniform);
            bw.upload(this.device.queue);
            return bw.buffer;
        }

        const gpuBuffer = this.device.createBuffer({
            label: 'uniform buffer',
            size: uniform.getByteSize(),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        const bw = new BufferWriter(uniform, gpuBuffer);
        bw.upload(this.device.queue);
        this.uniformBuffers.set(uniform, bw);
        return bw.buffer;
    }

    getVertexBuffer(geometry: BufferGeometry, slot: number): GPUBuffer {
        if (!this.vertexBuffers.has(geometry.id)) {
            this.vertexBuffers.set(geometry.id, new Map());
        } else if (this.vertexBuffers.get(geometry.id).has(slot)) {
            return this.vertexBuffers.get(geometry.id).get(slot);
        }

        const buf = geometry.getVertexBuffer(slot);

        const gpuBuffer = this.device.createBuffer({
            label: `geom #${geometry.id} @${VertexBufferSlot[slot]}`,
            size: buf.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        console.debug(`create buffer ${gpuBuffer.label}`);

        this.vertexBuffers.get(geometry.id).set(slot, gpuBuffer);

        this.device.queue.writeBuffer(gpuBuffer, 0, buf);

        return gpuBuffer;
    }

    getIndexBuffer(geometry: BufferGeometry): GPUBuffer {
        if (this.indexBuffers.has(geometry.id)) {
            return this.indexBuffers.get(geometry.id);
        }

        const gpuBuffer = this.device.createBuffer({
            label: `geom #${geometry.id} @Index`,
            size: geometry.indexBuffer.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        console.debug(`create buffer ${gpuBuffer.label}`);

        this.indexBuffers.set(geometry.id, gpuBuffer);

        this.device.queue.writeBuffer(gpuBuffer, 0, geometry.indexBuffer);

        return gpuBuffer;
    }
}

export default BufferStore;