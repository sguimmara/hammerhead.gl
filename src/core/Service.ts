import { Destroy } from '@/core';

/**
 * A service that can be registered and used
 * via a dependency injection pattern.
 */
export interface Service extends Destroy {
    /**
     * Returns the type name of this service.
     * This will be used as a key in the service resolution in the container.
     */
    getType(): string;
}
