#include ../chunks/basic.header.wgsl;

#include ../chunks/basic.vert.wgsl;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    var color = textureSample(colorTexture, colorSampler, input.texcoord);
    var g = (color.r + color.g + color.b) / 3.0;

    return vec4f(g, g, g, 1.0);
}