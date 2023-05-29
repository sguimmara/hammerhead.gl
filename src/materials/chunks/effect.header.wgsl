#include globalUniforms.wgsl;

@group(TEXTURE_BIND_GROUP) @binding(0) var colorSampler: sampler;
@group(TEXTURE_BIND_GROUP) @binding(1) var colorTexture: texture_2d<f32>;