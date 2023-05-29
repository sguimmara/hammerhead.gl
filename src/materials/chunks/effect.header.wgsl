#include globalUniforms.wgsl;

@group(OBJECT_UNIFORMS_BIND_GROUP) @binding(0) var colorTexture: texture_2d<f32>;
@group(OBJECT_UNIFORMS_BIND_GROUP) @binding(1) var colorSampler: sampler;