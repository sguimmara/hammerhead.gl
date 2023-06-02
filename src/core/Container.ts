import Destroy from "./Destroy";
import Service from "./Service";

class ContainerError extends Error {
    constructor(message: string) {
        super(message);
    }
}

/**
 * DI container.
 */
class Container implements Destroy {
    private readonly services: Map<string, Service>;

    constructor() {
        this.services = new Map();
    }

    /**
     * Registers a service into the container.
     * @param service The service to register.
     * @throws {ContainerError} The service is already registered.
     */
    register(service: Service) {
        if ( this.services.has(service.type)) {
            throw new ContainerError(`the service "${service.type}" is already registered`);
        }
        this.services.set(service.type, service);
    }

    /**
     * Gets a service from the container.
     * @param type The service type key.
     * @throws {ContainerError} The is not registered.
     */
    get<T extends Service>(type: string): T {
        if (this.services.has(type)) {
            return this.services.get(type) as T;
        }

        throw new ContainerError(`the service "${type}" is not registered`);
    }

    destroy() {
        this.services.forEach(s => s.destroy());
    }
}

export default Container;