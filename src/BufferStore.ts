import { VertexBufferSlot } from './constants';
import BufferGeometry from './geometries/BufferGeometry';

class BufferStore {
    private device: GPUDevice;
    private indexBuffers: Map<number, GPUBuffer>;
    private vertexBuffers: Map<number, Map<number, GPUBuffer>>;

    constructor(device: GPUDevice) {
        this.indexBuffers = new Map();
        this.vertexBuffers = new Map();
        this.device = device;
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

        this.vertexBuffers.get(geometry.id).set(slot, gpuBuffer);

        this.device.queue.writeBuffer(gpuBuffer, 0, buf);

        return gpuBuffer;
    }

    getIndexBuffer(geometry: BufferGeometry): GPUBuffer {
        if (this.indexBuffers.has(geometry.id)) {
            return this.indexBuffers.get(geometry.id);
        }

        const gpuBuffer = this.device.createBuffer({
            size: geometry.indexBuffer.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        this.indexBuffers.set(geometry.id, gpuBuffer);

        this.device.queue.writeBuffer(gpuBuffer, 0, geometry.indexBuffer);

        return gpuBuffer;
    }
}

export default BufferStore;