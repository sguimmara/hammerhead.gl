/* eslint-disable @typescript-eslint/unbound-method */
import { Container, Service } from '@/core';
import { describe, expect, it, beforeEach } from 'vitest';
import { mock } from 'vitest-mock-extended';

describe('get', () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    });

    it('should throw if the service is not registered', () => {
        expect(() => container.get('foo')).toThrowError(
            /the service "foo" is not registered/
        );
    });

    it('should return a registered service', () => {
        const service = mock<Service>();
        service.getType.mockReturnValue('foo');
        container.register(service);

        const resolved = container.get('foo');
        expect(resolved).toBe(service);
    });
});

describe('destroy', () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    });

    it('should destroy registered services', () => {
        const foo = mock<Service>();
        foo.getType.mockReturnValue('foo');

        const bar = mock<Service>();
        bar.getType.mockReturnValue('bar');

        container.register(foo);
        container.register(bar);

        expect(foo.destroy).not.toHaveBeenCalled();
        expect(bar.destroy).not.toHaveBeenCalled();

        container.destroy();

        expect(foo.destroy).toHaveBeenCalled();
        expect(bar.destroy).toHaveBeenCalled();
    });
});

describe('register', () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    });

    it('should throw if service is already registered', () => {
        const service = mock<Service>();
        service.getType.mockReturnValue('foo');
        container.register(service);

        expect(() => container.register(service)).toThrowError(
            /already registered/
        );
    });
});
