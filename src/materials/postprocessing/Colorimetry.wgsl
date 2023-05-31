#include ../chunks/effect.header.wgsl;

#include ../chunks/VSOutput.wgsl;
#include ../chunks/screenQuad.vert.wgsl;

@group(OBJECT_UNIFORMS_BIND_GROUP) @binding(2) var<uniform> saturation: f32;
@group(OBJECT_UNIFORMS_BIND_GROUP) @binding(3) var<uniform> brightness: f32;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    var color = textureSample(colorTexture, colorSampler, input.texcoord);
    var i = (color.r + color.g + color.b) / 3.0;

    var desaturated = vec4f(i, i, i, color.a);

    return mix(desaturated, color, saturation) * brightness;
}