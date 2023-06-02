#include constants.wgsl;

struct GlobalValues {
    time: f32,
    deltaTime: f32,
    screenSize: vec2f,
};

@group(GLOBAL_UNIFORMS) @binding(0) var<uniform> globals: GlobalValues;