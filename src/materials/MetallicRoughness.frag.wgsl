#include ./chunks/constants.wgsl;
#include ./chunks/GlobalValues.wgsl;
#include ./chunks/VSOutput.wgsl;

UNIFORM(albedoTexture, texture_2d<f32>)
UNIFORM(albedoSampler, sampler)

@fragment fn fs(vertex: VSOutput) -> @location(0) vec4f {
    var uv = vertex.texcoord;
    var albedo = textureSample(albedoTexture, albedoSampler, uv);
    var result = vertex.color * albedo;

    return result;
}