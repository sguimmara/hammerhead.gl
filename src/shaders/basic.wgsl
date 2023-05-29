#include chunks/basic.header.wgsl;

#include chunks/basic.vert.wgsl;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    return textureSample(colorTexture, colorSampler, input.texcoord);
}