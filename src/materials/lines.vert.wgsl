#include ./chunks/constants.wgsl;
#include ./chunks/VertexPulling.wgsl
#include ./chunks/VSOutput.wgsl
#include ./chunks/GlobalValues.wgsl

@group(OBJECT_UNIFORMS) @binding(0) var<uniform> modelMatrix: mat4x4f;

@vertex fn vs(vertex : Vertex) -> VSOutput {
    var localToElement = array<u32, 6>(0u, 1u, 1u, 2u, 2u, 0u);

    var triangleIndex = vertex.vertexID / 6u;
    var localVertexIndex = vertex.vertexID % 6u;

    var elementIndexIndex = 3u * triangleIndex + localToElement[localVertexIndex];
    var elementIndex = indices[elementIndexIndex];

    var position = vec4<f32>(
        positions[3 * elementIndex + 0],
        positions[3 * elementIndex + 1],
        positions[3 * elementIndex + 2],
        1.0
    );

    var m = modelMatrix;
    var v = globals.viewMatrix;
    var p = globals.projectionMatrix;
    var viewPosition = v * m * position;
    // To avoid z-fighting with solid meshes
    // TODO can we do better ?
    viewPosition.w += 0.002;
    var projected = p * viewPosition;

    var color = vec4<f32>(
        colors[3 * elementIndex + 0],
        colors[3 * elementIndex + 1],
        colors[3 * elementIndex + 2],
        colors[3 * elementIndex + 3],
    );

    var uv = vec2<f32>(
        texcoords[3 * elementIndex + 0],
        texcoords[3 * elementIndex + 1],
    );

    var output: VSOutput;

    output.position = projected;
    output.color = color;
    output.texcoord = uv;

    return output;
}