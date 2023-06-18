#include ./chunks/constants.wgsl;
#include ./chunks/GlobalValues.wgsl;
#include ./chunks/VSOutput.wgsl;

@group(material) @binding(auto) var albedoTexture: texture_2d<f32>;
@group(material) @binding(auto) var albedoSampler: sampler;

@group(material) @binding(auto) var emissiveTexture: texture_2d<f32>;
@group(material) @binding(auto) var emissiveSampler: sampler;

@group(material) @binding(auto) var aoTexture: texture_2d<f32>;
@group(material) @binding(auto) var aoSampler: sampler;

@group(material) @binding(auto) var normalTexture: texture_2d<f32>;
@group(material) @binding(auto) var normalSampler: sampler;

@group(material) @binding(auto) var metalRoughnessTexture: texture_2d<f32>;
@group(material) @binding(auto) var metalRoughnessSampler: sampler;

@fragment fn fs(vertex: VSOutput) -> @location(0) vec4f {
    var uv = vertex.texcoord;

    var albedo = textureSample(albedoTexture, albedoSampler, uv);
    var emissive = textureSample(emissiveTexture, emissiveSampler, uv);
    var ao = textureSample(aoTexture, aoSampler, uv);
    var normal = textureSample(normalTexture, normalSampler, uv);
    var metalRoughness = textureSample(metalRoughnessTexture, metalRoughnessSampler, uv);

    // TODO normal mapping
    // TODO lighting
    // TODO metal roughness
    var result = (albedo + emissive) * ao;

    return result;
}