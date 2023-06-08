#include ./chunks/constants.wgsl;
#include ./chunks/GlobalValues.wgsl;
#include ./chunks/VSOutput.wgsl;

@group(MATERIAL_UNIFORMS) @binding(0) var colorTexture: texture_2d<f32>;
@group(MATERIAL_UNIFORMS) @binding(1) var colorSampler: sampler;
@group(MATERIAL_UNIFORMS) @binding(2) var<uniform> color: vec4f;

@fragment fn fs(vertex: VSOutput) -> @location(0) vec4f {
    var textureColor = textureSample(colorTexture, colorSampler, vertex.texcoord);
    var result = vertex.color * color * textureColor;

    return result;
}