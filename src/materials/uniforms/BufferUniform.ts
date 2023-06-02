import Sized from "../../core/Sized";
import { Visitable, Visitor } from "../../core/Visitable";
import Uniform from "./Uniform";

export default abstract class BufferUniform implements Sized, Visitable, Uniform {
    abstract value: unknown;
    abstract getByteSize(): number;
    abstract visit(visitor: Visitor): void;
}
