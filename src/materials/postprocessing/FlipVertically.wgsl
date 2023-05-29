#include ../chunks/effect.header.wgsl;

#include ../chunks/VSOutput.wgsl;
#include ../chunks/screenQuad.vert.wgsl;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    var uv = vec2f(input.texcoord.x, 1.0 - input.texcoord.y);
    return textureSample(colorTexture, colorSampler, uv);
}