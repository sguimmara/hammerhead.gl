#include ../chunks/effect.header.wgsl;

#include ../chunks/VSOutput.wgsl;
#include ../chunks/screenQuad.vert.wgsl;

@group(OBJECT_UNIFORMS_BIND_GROUP) @binding(2) var<uniform> speed: f32;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    var color = textureSample(colorTexture, colorSampler, input.texcoord);

    var t = ((sin(globalUniforms.time * speed) + 1.0) / 2.0);

    return color * t;
}