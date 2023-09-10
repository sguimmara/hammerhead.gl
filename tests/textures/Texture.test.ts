import { RawSource, Texture } from '@/textures';
import { describe, expect, it, vi } from 'vitest';

describe('constructor', () => {
    it('should assign a unique id', () => {
        const source =  new RawSource(null, 123, 456);
        const texture1 = new Texture({ source });
        const texture2 = new Texture({ source });
        const texture3 = new Texture({ source });

        expect(texture1.id).not.toBe(texture2.id);
        expect(texture1.id).not.toBe(texture3.id);
    });

    it('should assign correct properties', () => {
        const source =  new RawSource(null, 123, 456);
        const texture = new Texture({
            source
        });

        expect(texture.source).toBe(source);
    });
});

describe('destroyed', () => {
    it('should raise an event', () => {
        const t = new Texture();

        const listener = vi.fn();
        t.on('destroyed', listener);

        expect(listener).not.toHaveBeenCalled();

        t.destroy();

        expect(listener).toHaveBeenCalledWith({ source: t });
    });
});
