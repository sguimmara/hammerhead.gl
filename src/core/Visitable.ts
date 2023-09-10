import { Color } from 'chroma-js';
import { Mat4, Vec2, Vec3, Vec4 } from 'wgpu-matrix';

/**
 * Visitor.
 */
interface Visitor {
    visitNumber(number: number): void;
    visitVec2(vec2: Vec2): void;
    visitVec3(vec2: Vec3): void;
    visitVec4(vec4: Vec4): void;
    visitMat4(value: Mat4): unknown;
    visitColor(color: Color): void;
}

/**
 * Trait for objects that can be visited.
 */
interface Visitable {
    /**
     * Visits this object with the provided visitor.
     * @param visitor The visitor.
     */
    visit(visitor: Visitor): void;
}

export { Visitable, Visitor };