struct VSOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

fn toColor(v: vec3f) -> vec4f {
    return vec4f(
        (v.x + 1.0) / 2.0,
        (v.y + 1.0) / 2.0,
        0.0,
        1.0
    );
}

struct Vertex {
    @location(0) position: vec3f,
};

@vertex fn vs(
   vertex: Vertex,
) -> VSOutput {
    var output: VSOutput;
    var position = vertex.position;
    output.position = vec4f(position, 1.0);
    output.color = toColor(position);
    return output;
}

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    return input.color;
}