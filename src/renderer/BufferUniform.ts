import Sized from "../Sized";
import { Visitable, Visitor } from "../Visitable";
import Uniform from "./Uniform";

export default abstract class BufferUniform implements Sized, Visitable, Uniform {
    abstract value: unknown;
    abstract getByteSize(): number;
    abstract visit(visitor: Visitor): void;
}
