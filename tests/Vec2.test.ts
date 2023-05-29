import Vec2 from '../src/Vec2';

describe('Vec2', () => {
    describe('constructor', () => {
        it('should assign values', () => {
            const vec2 = new Vec2(3, 2);
            expect(vec2.x).toEqual(3);
            expect(vec2.y).toEqual(2);
        });
    });

    describe('getByteSize', () => {
        it('should return 8', () => {
            const v = Vec2.zero;
            expect(v.getByteSize()).toEqual(8);
        });
    });
});