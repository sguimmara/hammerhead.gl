#include ./chunks/constants.wgsl;
#include ./chunks/GlobalValues.wgsl;
#include ./chunks/VSOutput.wgsl;

@group(material) @binding(auto) var colorTexture: texture_2d<f32>;
@group(material) @binding(auto) var colorSampler: sampler;
@group(material) @binding(auto) var<uniform> color: vec4f;

@fragment fn fs(vertex: VSOutput) -> @location(0) vec4f {
    var textureColor = textureSample(colorTexture, colorSampler, vertex.texcoord);
    var result = vertex.color * color * textureColor;

    return result;
}