import { Destroy } from "@/core";

export default class Block implements Destroy {
    readonly gpuBuffer: GPUBuffer;
    readonly byteOffset: number;
    readonly byteLength: number;

    constructor(gpuBuffer: GPUBuffer, byteOffset: number, byteLength: number) {
        this.gpuBuffer = gpuBuffer;
        this.byteLength = byteLength;
        this.byteOffset = byteOffset;
    }

    destroy(): void {
        this.gpuBuffer.destroy();
    }
}
