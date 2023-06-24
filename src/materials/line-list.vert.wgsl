#include ./chunks/constants.wgsl;
#include ./chunks/VertexPulling.wgsl
#include ./chunks/VSOutput.wgsl
#include ./chunks/GlobalValues.wgsl

@group(object) @binding(auto) var<uniform> modelMatrix: mat4x4f;
@group(material) @binding(auto) var<uniform> offset: f32;

@vertex fn vs(vertex : Vertex) -> VSOutput {
    var localToElement = array<u32, 6>(0u, 1u, 1u, 1u, 1u, 0u);

    var lineIndex = vertex.vertexID / 6u;
    var localVertexIndex = vertex.vertexID % 6u;

    var elementIndexIndex = 2 * lineIndex + localToElement[localVertexIndex];
    var elementIndex = indices[elementIndexIndex];

    var pos = vec4<f32>(
        position[3u * elementIndex + 0u],
        position[3u * elementIndex + 1u],
        position[3u * elementIndex + 2u],
        1.0,
    );

    var m = modelMatrix;
    var v = globals.viewMatrix;
    var p = globals.projectionMatrix;
    var viewPosition = v * m * pos;
    // To avoid z-fighting with solid meshes
    viewPosition.w += offset;
    var projected = p * viewPosition;

    var col = vec4<f32>(
        color[4u * elementIndex + 0u],
        color[4u * elementIndex + 1u],
        color[4u * elementIndex + 2u],
        color[4u * elementIndex + 3u],
    );

    var uv = vec2<f32>(
        texcoord[3u * elementIndex + 0u],
        texcoord[3u * elementIndex + 1u],
    );

    var output: VSOutput;

    output.position = projected;
    output.color = col;
    output.texcoord = uv;

    return output;
}