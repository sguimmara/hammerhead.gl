export enum FilterMode {
    Nearest,
    Linear,
}

export enum AddressMode {
    ClampToEdge,
    Repeat,
    Mirror,
}

/**
 * A texture sampler.
 */
export default class Sampler {
    magFilter: FilterMode = FilterMode.Linear;
    minFilter: FilterMode = FilterMode.Linear;
    addressModeU: AddressMode = AddressMode.ClampToEdge;
    addressModeV: AddressMode = AddressMode.ClampToEdge;
}