#include ../chunks/effect.header.wgsl;

#include ../chunks/VSOutput.wgsl;
#include ../chunks/screenQuad.vert.wgsl;

@group(OBJECT_UNIFORMS_BIND_GROUP) @binding(2) var<uniform> scale: vec2f;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    var uv = vec2f(input.texcoord.x * scale.x, input.texcoord.y * scale.y);
    return textureSample(colorTexture, colorSampler, uv);
}