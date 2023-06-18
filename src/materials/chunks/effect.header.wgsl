#include constants.wgsl
#include GlobalValues.wgsl;
#include VSOutput.wgsl;

@group(material) @binding(auto) var colorTexture: texture_2d<f32>;
@group(material) @binding(auto) var colorSampler: sampler;