import { Service } from "@/core";
import Block from "./Block";

export default class MemoryManager implements Service {
    private readonly device: GPUDevice;
    private readonly blocks: Map<object, Block>;
    private _bufferCount: number = 0;

    constructor(device: GPUDevice) {
        this.device = device;
        this.blocks = new Map();
    }

    getType(): string {
        return 'MemoryManager';
    }

    destroy(): void {
        this.blocks.forEach(v => v.destroy());
    }

    get bufferCount() {
        return this._bufferCount;
    }

    allocate(src: ArrayBufferView, usage: number, label?: string): Block {
        const buf = src.buffer;
        let block = this.blocks.get(buf);
        if (!block) {
            this._bufferCount++;
            const gpuBuf = this.device.createBuffer({
                size: buf.byteLength,
                usage,
                label
            });
            block = new Block(gpuBuf, src.byteOffset, src.byteLength);
            this.blocks.set(buf, block);
        };

        return block;
    }

    sync(src: ArrayBufferView, dst: Block) {
        this.device.queue.writeBuffer(
            dst.gpuBuffer,
            dst.byteOffset,
            src.buffer,
            src.byteOffset,
            src.byteLength
        );
    }
}
