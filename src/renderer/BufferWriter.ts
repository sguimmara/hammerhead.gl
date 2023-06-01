import { Color } from "chroma-js";
import Sized from "../core/Sized";
import Vec2 from "../core/Vec2";
import Vec4 from "../core/Vec4";
import { Visitor, Visitable } from "../core/Visitable";

/**
 * Serializes objects into buffers.
 * The serialized object must implement `Visitable` and `Sized`.
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

    visitVec4(vec4: Vec4): void {
        this.data[this.offset++] = vec4.x;
        this.data[this.offset++] = vec4.y;
        this.data[this.offset++] = vec4.z;
        this.data[this.offset++] = vec4.w;
    }

    visitColor(color: Color): void {
        const [r, g, b, a] = color.gl();
        this.data[this.offset++] = r;
        this.data[this.offset++] = g;
        this.data[this.offset++] = b;
        this.data[this.offset++] = a;
    }

    upload(queue: GPUQueue) {
        this.source.visit(this);

        queue.writeBuffer(this.buffer, 0, this.data);

        this.offset = 0;
    }
}

export default BufferWriter;