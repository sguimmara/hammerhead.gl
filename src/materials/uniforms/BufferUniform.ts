import { Sized, Version, Visitable, Visitor } from "@/core";
import Uniform from "./Uniform";

/**
 * A uniform that maps to a GPU buffer.
 */
export default abstract class BufferUniform implements Sized, Visitable, Version, Uniform {
    abstract value: unknown;
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
