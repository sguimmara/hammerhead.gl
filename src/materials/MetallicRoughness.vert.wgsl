#include ./chunks/GlobalValues.wgsl;
#include ./MetallicRoughnessVertex.wgsl;

struct Vertex {
    ATTRIBUTE(position, vec3f)
    ATTRIBUTE(texcoord, vec2f)
    ATTRIBUTE(normal, vec3f)
};

@group(OBJECT_UNIFORMS) @binding(0) var<uniform> modelMatrix: mat4x4f;

@vertex fn vs(
   vertex: Vertex,
) -> VSOutput {
    var output: VSOutput;

    var m = modelMatrix;
    var v = globals.viewMatrix;
    var p = globals.projectionMatrix;
    output.position = p * v * m * vec4f(vertex.position, 1.0);
    output.texcoord = vertex.texcoord;
    output.normal = vertex.normal; // TODO normal mapping

    return output;
}