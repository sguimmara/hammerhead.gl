@group(VERTEX_UNIFORMS) @binding(0) var<storage, read> positions : array<f32>;
@group(VERTEX_UNIFORMS) @binding(1) var<storage, read> texcoords : array<f32>;
@group(VERTEX_UNIFORMS) @binding(2) var<storage, read> colors    : array<f32>;
@group(VERTEX_UNIFORMS) @binding(3) var<storage, read> indices   : array<u32>;

struct Vertex {
	@builtin(instance_index) instanceID : u32,
	@builtin(vertex_index) vertexID : u32,
};
