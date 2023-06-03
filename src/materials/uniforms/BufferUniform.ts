import Sized from "../../core/Sized";
import Version from "../../core/Version";
import { Visitable, Visitor } from "../../core/Visitable";
import Uniform from "./Uniform";

export default abstract class BufferUniform implements Sized, Visitable, Version, Uniform {
    abstract value: unknown;
    version: number = 0;
    abstract getByteSize(): number;
    abstract visit(visitor: Visitor): void;

    needsUpdate() {
        this.version++;
    }
}
