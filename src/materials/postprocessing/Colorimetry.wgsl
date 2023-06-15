#include ../chunks/effect.header.wgsl;

UNIFORM(saturation, f32)
UNIFORM(brightness, f32)

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    var color = textureSample(colorTexture, colorSampler, input.texcoord);
    var i = (color.r + color.g + color.b) / 3.0;

    var desaturated = vec4f(i, i, i, color.a);

    return mix(desaturated, color, saturation) * brightness;
}