@group(OBJECT_UNIFORMS) @binding(0) var<uniform> modelMatrix: mat4x4f;

@vertex fn vs(
   vertex: Vertex,
) -> VSOutput {
    var output: VSOutput;

    var m = modelMatrix;
    var v = globals.viewMatrix;
    var p = globals.projectionMatrix;
    // var transform = globals.projectionMatrix * globals.viewMatrix * modelMatrix;
    var transform = p * v * m;
    output.position = transform * vec4f(vertex.position, 1.0);
    output.texcoord = vertex.texcoord;
    output.color = vertex.color;

    return output;
}