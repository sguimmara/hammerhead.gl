#include ./chunks/constants.wgsl;
#include ./chunks/VSOutput.wgsl;
#include ./chunks/GlobalValues.wgsl;

@vertex fn vs(
   vertex: Vertex,
) -> VSOutput {
    var output: VSOutput;

    output.position = vec4f(vertex.position, 1.0);
    output.texcoord = vertex.texcoord;
    output.color = vertex.color;

    return output;
}