#include ../chunks/basic.header.wgsl;

#include ../chunks/basic.vert.wgsl;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    var uv = vec2f(input.texcoord.x, 1.0 - input.texcoord.y);
    return textureSample(colorTexture, colorSampler, uv);
}