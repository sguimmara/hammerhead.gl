#include ./chunks/constants.wgsl;
#include ./chunks/VertexPulling.wgsl
#include ./chunks/VSOutput.wgsl
#include ./chunks/GlobalValues.wgsl

@group(object) @binding(auto) var<uniform> modelMatrix: mat4x4f;

@group(material) @binding(auto) var<uniform> pointSize: f32;

@vertex fn vs(vertex : Vertex) -> VSOutput {
    var vertexIndex = vertex.vertexID / 6u;
    var localIndex = vertex.vertexID % 6u;

    var position = vec4<f32>(
        vertexPosition[3 * vertexIndex + 0],
        vertexPosition[3 * vertexIndex + 1],
        vertexPosition[3 * vertexIndex + 2],
        1.0
    );

    var m = modelMatrix;
    var v = globals.viewMatrix;
    var p = globals.projectionMatrix;
    var coord = p * v * m * position;

    var halfSize = pointSize / 2f;
    var transX = coord.w / globals.screenSize.x * halfSize;
    var transY = coord.w / globals.screenSize.y * halfSize;
    if(localIndex == 0u){
        coord.x = coord.x - transX;
        coord.y = coord.y - transY;
    }else if(localIndex == 2u){
        coord.x = coord.x + transX;
        coord.y = coord.y - transY;
    }else if(localIndex == 1u){
        coord.x = coord.x + transX;
        coord.y = coord.y + transY;
    }else if(localIndex == 3u){
        coord.x = coord.x - transX;
        coord.y = coord.y - transY;
    }else if(localIndex == 5u){
        coord.x = coord.x + transX;
        coord.y = coord.y + transY;
    }else if(localIndex == 4u){
        coord.x = coord.x - transX;
        coord.y = coord.y + transY;
    }

    var color = vec4<f32>(
        vertexColor[4 * vertexIndex + 0],
        vertexColor[4 * vertexIndex + 1],
        vertexColor[4 * vertexIndex + 2],
        vertexColor[4 * vertexIndex + 3],
    );

    var uv = vec2<f32>(
        vertexTexcoord[3 * vertexIndex + 0],
        vertexTexcoord[3 * vertexIndex + 1],
    );

    var output: VSOutput;

    output.position = coord;
    output.color = color;
    output.texcoord = uv;

    return output;
}