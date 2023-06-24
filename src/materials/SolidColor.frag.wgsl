#include ./chunks/constants.wgsl;
#include ./chunks/GlobalValues.wgsl;
#include ./chunks/VSOutput.wgsl;

@group(material) @binding(auto) var<uniform> color: vec4f;

@fragment fn fs(vertex: VSOutput) -> @location(0) vec4f {
    return color;
}