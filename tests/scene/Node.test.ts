import { Node } from '@scene';
import { describe, expect, it, vi } from 'vitest';

describe('constructor', () => {
    it('should assign a unique id', () => {
        const obj1 = new Node();
        const obj2 = new Node();
        const obj3 = new Node();

        expect(obj1.id).not.toEqual(obj2.id);
        expect(obj2.id).not.toEqual(obj3.id);
    });
});

describe('destroyed', () => {
    it('should dispatch a "destroyed" event', () => {
        const obj = new Node();

        const handler = vi.fn();
        obj.on('destroyed', handler);

        obj.destroy();

        expect(handler).toHaveBeenCalledWith({ source: obj });
    });
});

describe('add', () => {
    it("should set the child's parent", () => {
        const parent = new Node();
        const child = new Node();

        expect(parent.children).toBeUndefined();
        expect(child.parent).toBeUndefined();

        parent.add(child);

        expect(parent.children).toEqual([child]);
        expect(child.parent).toBe(parent);
    });

    it('should dispatch the "parent-changed" event on the child', () => {
        const parent = new Node();
        const child = new Node();

        const handler = vi.fn();
        child.on('parent-changed', handler);

        expect(handler).not.toHaveBeenCalled();

        parent.add(child);

        expect(handler).toHaveBeenCalledWith({ source: child, value: { old: undefined, new: parent } });
    });
});

describe('traverse', () => {
    it('should call itself once, then each child once', () => {
        const parent = new Node();
        const child1 = new Node();
        const child2 = new Node();
        const grandChild1 = new Node();
        const grandChild2 = new Node();

        parent.add(child1);
        parent.add(child2);

        child1.add(grandChild1);
        child2.add(grandChild2);

        const traversed: Node[] = [];

        parent.traverse(c => traversed.push(c));

        expect(traversed).toEqual([parent, child1, grandChild1, child2, grandChild2]);
    });
});
