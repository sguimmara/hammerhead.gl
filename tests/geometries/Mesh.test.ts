import { Mesh } from "@/geometries";
import { describe, expect, it, vi } from "vitest";

describe('constructor', () => {
    it('should assign a unique id', () => {
        const m0 = new Mesh();
        const m1 = new Mesh();
        const m2 = new Mesh();

        expect(m0.id).not.toEqual(m1.id);
        expect(m0.id).not.toEqual(m2.id);
    });

    it('should set default values for optional parameters', () => {
        const m = new Mesh();
        expect(m.frontFace).toEqual('cw');
        expect(m.topology).toEqual('triangle-list');
    });

    it('should assign the topology and frontFace', () => {
        const m = new Mesh({ topology: 'line-strip', frontFace: 'ccw' });
        expect(m.topology).toEqual('line-strip');
        expect(m.frontFace).toEqual('ccw');
    });
});

describe('destroyed', () => {
    it('should raise the destroy event', () => {
        const m = new Mesh();
        const listener = vi.fn();

        m.on('destroyed', listener);

        m.destroy();

        expect(listener).toHaveBeenCalledWith({ source: m });
    });
});

describe('getAttribute', () => {
    it('should throw if position attribute is not set', () => {
        const m = new Mesh();

        expect(() => m.getAttribute('position')).toThrow(/no position attribute/);
    });

    it('should return an inialized array if no attribute is found', () => {
        const m = new Mesh();

        m.setAttribute('position', new Float32Array(9));
        expect(m.getAttribute('texcoord').value).toHaveLength(6);
        expect(m.getAttribute('texcoord1').value).toHaveLength(6);
        expect(m.getAttribute('texcoord2').value).toHaveLength(6);
        expect(m.getAttribute('normal').value).toHaveLength(9);
        expect(m.getAttribute('color').value).toHaveLength(12);
        expect(m.getAttribute('tangent').value).toHaveLength(9);
    });
});

describe('setAttribute', () => {
    it('should assign the attribute buffer', () => {
        const m = new Mesh();
        const positions = new Float32Array(12);

        m.setAttribute('position', positions);

        expect(m.getAttribute('position').value).toBe(positions);
        expect(m.vertexCount).toEqual(positions.length / 3);
    });

    describe('indexCount', () => {
        it('should return the correct value', () => {
            const m = new Mesh();
            expect(m.indexCount).toEqual(0);
            m.setIndices(new Uint16Array(11));
            expect(m.indexCount).toEqual(11);
        });
    });

    describe('getBounds', () => {
        it('should return the bounds computed from the position array', () => {
            const m = new Mesh();
            const positions = new Float32Array([
                1, 2, 3,
                3, 4, 5,
                6, 7, 8,
            ]);
            m.setAttribute('color', new Float32Array(9));
            m.setAttribute('position', positions);

            const bounds = m.getBounds();
            expect(bounds.min).toEqual(new Float32Array([1, 2, 3]));
            expect(bounds.max).toEqual(new Float32Array([6, 7, 8]));
        });
    });

    describe('indexSize', () => {
        it('should return uint16 if index buffer is Uint16Array', () => {
            const m = new Mesh();
            m.setIndices(new Uint16Array());

            expect(m.indexFormat).toEqual('uint16');
        });

        it('should return uint32 if index buffer is Uint32Array', () => {
            const m = new Mesh();
            m.setIndices(new Uint32Array());

            expect(m.indexFormat).toEqual('uint32');
        });
    });

    it('should increment the version', () => {
        const m = new Mesh();

        const posAttr = m.setAttribute('position', new Float32Array());
        expect(posAttr.getVersion()).toEqual(0);

        m.setAttribute('position', new Float32Array());
        expect(posAttr.getVersion()).toEqual(1);
    });
});

describe('clone', () => {
    it('should copy the index buffer', () => {
        const m0 = new Mesh();
        const indices = new Uint16Array();
        m0.setIndices(indices);
        const m1 = m0.clone();

        expect(m0.indexFormat).toEqual('uint16');
        expect(m1.indexFormat).toEqual('uint16');
        expect(m1.getIndices()).toBe(indices);
    });

    it('should copy topology and frontFace', () => {
        const m0 = new Mesh({ topology: 'point-list', frontFace: 'ccw' });
        const m1 = m0.clone();
        expect(m1.topology).toEqual('point-list');
        expect(m1.frontFace).toEqual('ccw');
    });

    it('should copy attributes', () => {

    });
});

describe('setIndices', () => {
    it('should assign the index buffer and increment the version', () => {
        const mesh = new Mesh();
        const uint16 = new Uint16Array();
        const uint32 = new Uint32Array();

        let version = mesh.getVersion();
        mesh.setIndices(uint16);
        expect(mesh.getIndices()).toBe(uint16);
        expect(mesh.getVersion()).not.toEqual(version);

        version = mesh.getVersion();
        mesh.setIndices(uint32);
        expect(mesh.getIndices()).toBe(uint32);
        expect(mesh.getVersion()).not.toEqual(version);
    });
});
