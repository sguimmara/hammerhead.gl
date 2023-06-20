import { Service } from "@/core";

export default class MemoryManager implements Service {
    private readonly device: GPUDevice;
    private readonly buffers: Map<object, GPUBuffer>;

    constructor(device: GPUDevice) {
        this.device = device;
        this.buffers = new Map();
    }

    getType(): string {
        return 'MemoryManager';
    }

    destroy(): void {
        this.buffers.forEach(v => v.destroy());
    }

    createBuffer(src: ArrayBufferView, usage: number, label?: string): GPUBuffer {
        const buf = src.buffer;
        let gpuBuf = this.buffers.get(buf);
        if (!gpuBuf) {
            gpuBuf = this.device.createBuffer({
                size: buf.byteLength,
                usage,
                label
            });
            this.buffers.set(buf, gpuBuf);
        };

        return gpuBuf;
    }

    sync(src: ArrayBufferView, dst: GPUBuffer) {
        this.device.queue.writeBuffer(
            dst,
            0,
            src.buffer,
            src.byteOffset,
            src.byteLength
        );
    }
}
