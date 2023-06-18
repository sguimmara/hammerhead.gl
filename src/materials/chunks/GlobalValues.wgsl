struct GlobalValues {
    time: f32,
    deltaTime: f32,
    screenSize: vec2f,
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
};

@group(global) @binding(auto) var<uniform> globals: GlobalValues;