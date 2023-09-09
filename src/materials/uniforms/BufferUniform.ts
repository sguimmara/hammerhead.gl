import { Sized, Version, Visitable, Visitor } from "@/core";
import Uniform, { UntypedUniform } from "./Uniform";

/**
 * Contained a buffer uniform whose exact type is unspecified.
 */
export interface UntypedBufferUniform extends UntypedUniform, Sized, Visitable, Version {}

/**
 * A uniform that maps to a GPU buffer. Buffer uniforms can contain anything that can be laid out in
 * memory, such as scalars, vectors, matrices, or arbitrary objects, but not textures nor samplers,
 * which use a dedicated backing type in the WebGPU API.
 * @param {V} V The wrapped value type.
 */
export default abstract class BufferUniform<V> implements UntypedBufferUniform, Uniform<V> {
    readonly isBufferUniform = true;
    abstract value: V;
    private version: number = -1;
    abstract getByteSize(): number;
    abstract visit(visitor: Visitor): void;

    getVersion(): number {
        return this.version;
    }

    incrementVersion(): void {
        this.version++;
    }
}
