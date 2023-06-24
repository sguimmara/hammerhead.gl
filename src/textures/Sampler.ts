export enum FilterMode {
    Nearest = "nearest",
    Linear = "linear",
}

export enum AddressMode {
    ClampToEdge = "clamp-to-edge",
    Repeat = "repeat",
    Mirror = "mirror-repeat",
}

/**
 * A texture sampler.
 */
export default class Sampler {
    magFilter: FilterMode = FilterMode.Linear;
    minFilter: FilterMode = FilterMode.Linear;
    addressModeU: AddressMode = AddressMode.Repeat;
    addressModeV: AddressMode = AddressMode.Repeat;
}
