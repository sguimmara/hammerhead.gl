import { Color } from "chroma-js";
import { Mat4, Vec2, Vec3, Vec4 } from "wgpu-matrix";
import Sized from "../core/Sized";
import { Visitor, Visitable } from "../core/Visitable";
import Version from "../core/Version";

type Source = Sized & Visitable & Version;

/**
 * Serializes objects into buffers.
 * The serialized object must implement `Visitable` and `Sized`.
 */
class BufferWriter implements Visitor
{
    readonly buffer: GPUBuffer;
    private readonly source: Source;
    private readonly device: GPUDevice;
    private offset: number;
    private data: Float32Array;
    private version: number;

    constructor(source: Source, buffer: GPUBuffer, device: GPUDevice) {
        this.offset = 0;
        this.version = null;
        this.source = source;
        this.buffer = buffer;
        const sourceSize = this.source.getByteSize();
        this.data = new Float32Array(sourceSize / 4);
        this.device = device;
        this.data.fill(0);
        if (buffer.size != sourceSize) {
            throw new Error(`size mismatch: source is ${sourceSize}, but buffer is ${buffer.size}`);
        }
    }

    private checkExists(v: unknown, type: string) {
        if (!v) {
            throw new Error(`missing uniform <${type}> value`);
        }
    }

    visitNumber(number: number): void {
        this.data[this.offset++] = number;
    }

    visitVec2(v: Vec2): void {
        this.checkExists(v, 'Vec2');
        this.data.set(v, this.offset);
        this.offset += 2;
    }

    visitVec3(v: Vec3): void {
        this.checkExists(v, 'Vec3');
        this.data.set(v, this.offset);
        this.offset += 3;
    }

    visitVec4(v: Vec4): void {
        this.checkExists(v, 'Vec4');
        this.data.set(v, this.offset);
        this.offset += 4;
    }

    visitColor(v: Color): void {
        this.checkExists(v, 'Color');
        const [r, g, b, a] = v.gl();
        this.data[this.offset++] = r;
        this.data[this.offset++] = g;
        this.data[this.offset++] = b;
        this.data[this.offset++] = a;
    }

    visitMat4(v: Mat4): void {
        this.checkExists(v, 'Mat4');
        this.data.set(v, this.offset);
        this.offset += 16;
    }

    /**
     * Updates the GPU buffer with the values from the source.
     */
    update() {
        if (this.version != this.source.version) {
            this.source.visit(this);
            this.device.queue.writeBuffer(this.buffer, 0, this.data);
            this.offset = 0;
            this.version = this.source.version;
        }
    }
}

export default BufferWriter;