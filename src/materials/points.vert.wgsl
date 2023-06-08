#include ./chunks/constants.wgsl;
#include ./chunks/VertexPulling.wgsl
#include ./chunks/VSOutput.wgsl
#include ./chunks/GlobalValues.wgsl

@group(OBJECT_UNIFORMS) @binding(0) var<uniform> modelMatrix: mat4x4f;

@vertex fn vs(vertex : Vertex) -> VSOutput {
    var vertexIndex = vertex.vertexID / 6u;
	var localIndex = vertex.vertexID % 6u;

	var position = vec4<f32>(
		positions[3 * vertexIndex + 0],
		positions[3 * vertexIndex + 1],
		positions[3 * vertexIndex + 2],
		1.0
	);

    var m = modelMatrix;
    var v = globals.viewMatrix;
    var p = globals.projectionMatrix;
	var viewPos = v * m * position;

	// transform in view-space to create quad.
	// quad size in world units, not pixels.
	// for pixel-size, could try to offset projected coordinates
	// combined with uniforms.screen_width & height
	var transX = 0.2f;
	var transY = 0.2f;
	if(localIndex == 0u){
		viewPos.x = viewPos.x - transX;
		viewPos.y = viewPos.y - transY;
	}else if(localIndex == 2u){
		viewPos.x = viewPos.x + transX;
		viewPos.y = viewPos.y - transY;
	}else if(localIndex == 1u){
		viewPos.x = viewPos.x + transX;
		viewPos.y = viewPos.y + transY;
	}else if(localIndex == 3u){
		viewPos.x = viewPos.x - transX;
		viewPos.y = viewPos.y - transY;
	}else if(localIndex == 5u){
		viewPos.x = viewPos.x + transX;
		viewPos.y = viewPos.y + transY;
	}else if(localIndex == 4u){
		viewPos.x = viewPos.x - transX;
		viewPos.y = viewPos.y + transY;
	}

	var projected = p * viewPos;

	var color = vec4<f32>(
		colors[4 * vertexIndex + 0],
		colors[4 * vertexIndex + 1],
		colors[4 * vertexIndex + 2],
		colors[4 * vertexIndex + 3],
	);

	var uv = vec2<f32>(
		texcoords[3 * vertexIndex + 0],
		texcoords[3 * vertexIndex + 1],
	);

	var output: VSOutput;

	output.position = projected;
	output.color = color;
	output.texcoord = uv;

	return output;
}