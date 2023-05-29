#include ../chunks/effect.header.wgsl;

#include ../chunks/VSOutput.wgsl;
#include ../chunks/screenQuad.vert.wgsl;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    var color = textureSample(colorTexture, colorSampler, input.texcoord);
    var i = (color.r + color.g + color.b) / 3.0;
    var r = color.r;
    var g = color.g;
    var b = color.b;
    var t = (sin(globalUniforms.time * 10) + 1) / 2.0;

    return vec4f(mix(i, r, t), mix(i, g, t), mix(i, b, t), 1.0);
}