@group(OBJECT_UNIFORMS) @binding(0) var<uniform> worldMatrix: mat4x4f;

@vertex fn vs(
   vertex: Vertex,
) -> VSOutput {
    var output: VSOutput;

    output.position = worldMatrix * vec4f(vertex.position, 1.0);
    output.texcoord = vertex.texcoord;
    output.color = vertex.color;

    return output;
}