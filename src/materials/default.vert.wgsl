#include ./chunks/constants.wgsl;
#include ./chunks/Vertex.wgsl;
#include ./chunks/VSOutput.wgsl;
#include ./chunks/GlobalValues.wgsl;

@group(object) @binding(auto) var<uniform> modelMatrix: mat4x4f;

@vertex fn vs(
   vertex: Vertex,
) -> VSOutput {
    var output: VSOutput;

    var m = modelMatrix;
    var v = globals.viewMatrix;
    var p = globals.projectionMatrix;
    output.position = p * v * m * vec4f(vertex.position, 1.0);
    output.texcoord = vertex.texcoord;
    output.color = vertex.color;

    return output;
}