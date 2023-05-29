#include ./chunks/VSOutput.wgsl;

@group(0) @binding(0) var colorSampler: sampler;
@group(0) @binding(1) var colorTexture: texture_2d<f32>;

#include ./chunks/screenQuad.vert.wgsl;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    return textureSample(colorTexture, colorSampler, input.texcoord);
}