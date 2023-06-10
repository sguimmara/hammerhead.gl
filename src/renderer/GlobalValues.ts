import { Sized, Visitable, Version, Visitor } from '@/core';
import { Mat4, Vec2, vec2 } from 'wgpu-matrix';

class GlobalValues implements Sized, Visitable, Version {
    time: number = 0;
    deltaTime: number = 0;
    screenSize: Vec2 = vec2.zero();
    viewMatrix: Mat4;
    projectionMatrix: Mat4;
    private version: number;

    getVersion(): number {
        return this.version;
    }

    incrementVersion(): void {
        this.version++;
    }

    getByteSize(): number {
        const f32 = 4;

        return f32 // time
            + f32  // deltaTime
            + 2 * f32 // screenSize;
            + 16 * f32 // projectionMatrix
            + 16 * f32 // viewMatrix
            ;
    }

    visit(visitor: Visitor): void {
        visitor.visitNumber(this.time);
        visitor.visitNumber(this.deltaTime);
        visitor.visitVec2(this.screenSize);
        visitor.visitMat4(this.viewMatrix);
        visitor.visitMat4(this.projectionMatrix);
    }
}

export default GlobalValues;
