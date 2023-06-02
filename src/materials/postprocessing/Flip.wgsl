#include ../chunks/effect.header.wgsl;

#include ../chunks/VSOutput.wgsl;
#include ../chunks/screenQuad.vert.wgsl;

@group(OBJECT_UNIFORMS_BIND_GROUP) @binding(2) var<uniform> flip: vec2f;

@fragment fn fs(input: VSOutput) -> @location(0) vec4f {
    var u = input.texcoord.x;
    var v = input.texcoord.y;
    u = mix(u, 1 - u, flip.x);
    v = mix(v, 1 - v, flip.y);
    return textureSample(colorTexture, colorSampler, vec2f(u, v));
}