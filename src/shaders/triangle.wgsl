@vertex fn vs(
    @builtin(vertex_index) vertexIndex : u32
) -> @builtin(position) vec4f {
var pos = array<vec2f, 3>(
    vec2f(-1.0,  1.0),  // top left
    vec2f( 1.0,  1.0),  // bottom left
    vec2f(-1.0, -1.0)   // bottom right
);

return vec4f(pos[vertexIndex], 0.0, 1.0);
}

@fragment fn fs() -> @location(0) vec4f {
return vec4f(1.0, 0.0, 0.0, 1.0);
}