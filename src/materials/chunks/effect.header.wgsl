#include constants.wgsl
#include GlobalValues.wgsl;
#include VSOutput.wgsl;

@group(MATERIAL_UNIFORMS) @binding(0) var colorTexture: texture_2d<f32>;
@group(MATERIAL_UNIFORMS) @binding(1) var colorSampler: sampler;