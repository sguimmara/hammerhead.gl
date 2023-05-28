struct VSOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

struct Vertex {
    @location(0) position: vec3f,
    @location(1) texcoord: vec2f,
};

@vertex fn vs(
   vertex: Vertex,
) -> VSOutput {
    var output: VSOutput;

    output.position = vec4f(vertex.position, 1.0);
    output.color = vec4f(vertex.texcoord, 0.0, 1.0);

    return output;
}

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    return input.color;
}