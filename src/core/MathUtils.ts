import { degrees, radians } from "./types";

export function deg2rad(deg: degrees): radians {
    return deg * Math.PI / 180;
}

export function random(min: number, max: number) {
    return min + (Math.random() * (max - min));
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

export default {
    deg2rad,
    random,
    clamp
}
