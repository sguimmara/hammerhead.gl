#include constants.wgsl;

struct GlobalUniforms {
    time: f32,
};

@group(GLOBAL_UNIFORMS_BIND_GROUP) @binding(0) var<uniform> globalUniforms: GlobalUniforms;