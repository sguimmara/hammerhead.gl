import { Destroy } from "@/core";

/**
 * A service that can be registered and used
 * via a dependency injection pattern.
 */
export interface Service extends Destroy {
    type: string;
}
