#include ./chunks/VSOutput.wgsl;
#include ./chunks/GlobalValues.wgsl;

@group(OBJECT_UNIFORMS_BIND_GROUP) @binding(0) var colorTexture: texture_2d<f32>;
@group(OBJECT_UNIFORMS_BIND_GROUP) @binding(1) var colorSampler: sampler;
@group(OBJECT_UNIFORMS_BIND_GROUP) @binding(2) var<uniform> color: vec4f;

#include ./chunks/screenQuad.vert.wgsl;

@fragment fn fs(vertex: VSOutput) -> @location(0) vec4f {
    return vertex.color * color * textureSample(colorTexture, colorSampler, vertex.texcoord);
}