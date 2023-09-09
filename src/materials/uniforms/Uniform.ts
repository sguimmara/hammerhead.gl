import { Version } from "@/core";

export interface UntypedUniform {
    value: unknown;
}

/**
 * A uniform is a resource bound to a shader that will remain constant for all invocations
 * of this shader for a given material/geometry/object.
 * @param {V} V The wrapped value contained in this uniform.
 */
export default interface Uniform<V> extends UntypedUniform, Version {
    value: V;
}
