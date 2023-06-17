#include ./chunks/constants.wgsl;
#include ./chunks/VertexPulling.wgsl
#include ./chunks/VSOutput.wgsl
#include ./chunks/GlobalValues.wgsl

@group(OBJECT_UNIFORMS) @binding(0) var<uniform> modelMatrix: mat4x4f;

UNIFORM(offset, f32);

@vertex fn vs(vertex : Vertex) -> VSOutput {
    var localToElement = array<u32, 6>(0u, 1u, 1u, 1u, 1u, 0u);

    var lineIndex = vertex.vertexID / 6u;
    var localVertexIndex = vertex.vertexID % 6u;

    var elementIndexIndex = 2 * lineIndex + localToElement[localVertexIndex];
    var elementIndex = indices[elementIndexIndex];

    var position = vec4<f32>(
        positions[3u * elementIndex + 0u],
        positions[3u * elementIndex + 1u],
        positions[3u * elementIndex + 2u],
        1.0,
    );

    var m = modelMatrix;
    var v = globals.viewMatrix;
    var p = globals.projectionMatrix;
    var viewPosition = v * m * position;
    // To avoid z-fighting with solid meshes
    viewPosition.w += offset;
    var projected = p * viewPosition;

    var color = vec4<f32>(
        colors[4u * elementIndex + 0u],
        colors[4u * elementIndex + 1u],
        colors[4u * elementIndex + 2u],
        colors[4u * elementIndex + 3u],
    );

    var uv = vec2<f32>(
        texcoords[3u * elementIndex + 0u],
        texcoords[3u * elementIndex + 1u],
    );

    var output: VSOutput;

    output.position = projected;
    output.color = color;
    output.texcoord = uv;

    return output;
}