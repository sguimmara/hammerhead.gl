#include ../chunks/basic.header.wgsl;

#include ../chunks/basic.vert.wgsl;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    var color = textureSample(colorTexture, colorSampler, input.texcoord);

    return vec4f(1 - color.r, 1 - color.g, 1 - color.b, 1.0);
}