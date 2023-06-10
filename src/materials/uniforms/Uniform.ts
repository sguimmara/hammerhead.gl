/**
 * A uniform is a resource bound to a shader that will remain constant for all invocations
 * of this shader for a given material/geometry/object.
 */
export default interface Uniform {
    value: unknown;
}
