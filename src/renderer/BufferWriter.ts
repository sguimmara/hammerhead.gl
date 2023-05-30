import Sized from "../Sized";
import Vec2 from "../Vec2";
import { Visitor, Visitable } from "../Visitable";

/**
 * Serializes objects into buffers.
 */
class BufferWriter implements Visitor
{
    readonly buffer: GPUBuffer;
    private readonly source: Sized & Visitable;
    private offset: number;
    private data: Float32Array;

    constructor(source: Sized & Visitable, buffer: GPUBuffer) {
        this.offset = 0;
        this.source = source;
        this.buffer = buffer;
        const sourceSize = this.source.getByteSize();
        this.data = new Float32Array(sourceSize / 4);
        this.data.fill(0);
        if (buffer.size != sourceSize) {
            throw new Error(`size mismatch: source is ${sourceSize}, but buffer is ${buffer.size}`);
        }
    }

    visitNumber(number: number): void {
        this.data[this.offset++] = number;
    }

    visitVec2(vec2: Vec2): void {
        this.data[this.offset++] = vec2.x;
        this.data[this.offset++] = vec2.y;
    }

    upload(queue: GPUQueue) {
        this.source.visit(this);

        queue.writeBuffer(this.buffer, 0, this.data);

        this.offset = 0;
    }
}

export default BufferWriter;