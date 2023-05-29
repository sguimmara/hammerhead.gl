#include ./chunks/VSOutput.wgsl;
#include ./chunks/globalUniforms.wgsl;

@group(TEXTURE_BIND_GROUP) @binding(0) var colorSampler: sampler;
@group(TEXTURE_BIND_GROUP) @binding(1) var colorTexture: texture_2d<f32>;

#include ./chunks/screenQuad.vert.wgsl;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    return textureSample(colorTexture, colorSampler, input.texcoord);
}