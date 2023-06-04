struct GlobalValues {
    time: f32,
    deltaTime: f32,
    screenSize: vec2f,
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
};

@group(GLOBAL_UNIFORMS) @binding(0) var<uniform> globals: GlobalValues;