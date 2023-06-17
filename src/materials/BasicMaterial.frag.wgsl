#include ./chunks/constants.wgsl;
#include ./chunks/GlobalValues.wgsl;
#include ./chunks/VSOutput.wgsl;

UNIFORM(colorTexture, texture_2d<f32>)
UNIFORM(colorSampler, sampler)
UNIFORM(color, vec4f)

@fragment fn fs(vertex: VSOutput) -> @location(0) vec4f {
    var textureColor = textureSample(colorTexture, colorSampler, vertex.texcoord);
    var result = vertex.color * color * textureColor;

    return result;
}