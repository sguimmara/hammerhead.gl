struct VSOutput {
    @builtin(position) position: vec4f,
    @location(0) texcoord: vec2f,
};

struct Vertex {
    @location(0) position: vec3f,
    @location(1) texcoord: vec2f,
};