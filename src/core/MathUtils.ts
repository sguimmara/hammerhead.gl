export function deg2rad(deg: number) {
    return deg * Math.PI / 180;
}

export function random(min: number, max: number) {
    return min + (Math.random() * (max - min));
}

export default {
    deg2rad,
    random
}