#include ./chunks/constants.wgsl;
#include ./chunks/VertexPulling.wgsl
#include ./chunks/VSOutput.wgsl
#include ./chunks/GlobalValues.wgsl

@group(object) @binding(auto) var<uniform> modelMatrix: mat4x4f;
@group(material) @binding(auto) var<uniform> offset: f32;

const LOCAL_TO_ELEMENT = array<u32, 6>(0u, 1u, 1u, 1u, 1u, 0u);

@vertex fn vs(vertex : Vertex) -> VSOutput {
    var lineIndex = vertex.vertexID / 6u;
    var localVertexIndex = vertex.vertexID % 6u;

    var elementIndexIndex = 2 * lineIndex + LOCAL_TO_ELEMENT[localVertexIndex];
    var elementIndex = indices[elementIndexIndex];

    var pos = vec4<f32>(
        vertexPosition[3u * elementIndex + 0u],
        vertexPosition[3u * elementIndex + 1u],
        vertexPosition[3u * elementIndex + 2u],
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
        vertexColor[4u * elementIndex + 0u],
        vertexColor[4u * elementIndex + 1u],
        vertexColor[4u * elementIndex + 2u],
        vertexColor[4u * elementIndex + 3u],
    );

    var uv = vec2<f32>(
        vertexTexcoord[3u * elementIndex + 0u],
        vertexTexcoord[3u * elementIndex + 1u],
    );

    var output: VSOutput;

    output.position = projected;
    output.color = col;
    output.texcoord = uv;

    return output;
}