@group(vertex) @binding(auto) var<storage, read> vertexPosition : array<f32>;
@group(vertex) @binding(auto) var<storage, read> vertexTexcoord : array<f32>;
@group(vertex) @binding(auto) var<storage, read> vertexColor    : array<f32>;
@group(vertex) @binding(auto) var<storage, read> indices   : array<u32>;

struct Vertex {
	@builtin(instance_index) instanceID : u32,
	@builtin(vertex_index) vertexID : u32,
};
