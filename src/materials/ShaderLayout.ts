import { BindGroup } from '@/core';
import ShaderError from './ShaderError';
import UniformType from './UniformType';
import AttributeType from './AttributeType';
import { Attribute } from '@/geometries';

export class UniformInfo {
    readonly binding: number;
    readonly type: UniformType;
    readonly group: BindGroup;
    readonly name: string;
    readonly presentInVertexShader: boolean;
    readonly presentInFragmentShader: boolean;

    constructor(
        group: BindGroup,
        binding: number,
        type: UniformType,
        name: string,
        presentInVertexShader: boolean,
        presentInFragmentShader: boolean,
    ) {
        this.name = name;
        this.group = group;
        this.binding = binding;
        this.type = type;
        this.presentInVertexShader = presentInVertexShader;
        this.presentInFragmentShader = presentInFragmentShader;
    }
}

export class AttributeInfo {
    readonly location: number;
    readonly type: AttributeType;
    readonly name: Attribute;

    constructor(location: number, type: AttributeType, name: Attribute) {
        this.location = location;
        this.type = type;
        this.name = name;
    }
}

function getBindGroupBitmask(uniforms: UniformInfo[]) {
    let result = 0;
    for (let i = 0; i < uniforms.length; i++) {
        const uniform = uniforms[i];
        const mask = 1 << uniform.group;
        result |= mask;
    }
    return result;
}

export class ShaderLayout {
    readonly uniforms: UniformInfo[];
    readonly attributes: AttributeInfo[];
    readonly bindGroupBitmask: number;

    constructor(attributes: AttributeInfo[], uniforms: UniformInfo[]) {
        this.attributes = attributes;
        this.uniforms = uniforms;
        this.bindGroupBitmask = getBindGroupBitmask(uniforms);
    }

    getAttributeLocation(name: Attribute): number {
        // We expect the caller to cache the result.
        const array = this.attributes;
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            if (element.name === name) {
                return element.location;
            }
        }

        throw new ShaderError(`no such attribute: ${name}`);
    }

    getBindGroup(group: BindGroup): UniformInfo[] {
        const result = [];
        const array = this.uniforms;
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            if (element.group === group) {
                result.push(element);
            }
        }
        return result;
    }

    hasBindGroup(group: BindGroup): boolean {
        const mask = 1 << group;
        return (this.bindGroupBitmask & mask) != 0;
    }

    getUniformBinding(name: string): number {
        // We expect the caller to cache the result.
        const array = this.uniforms;
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            if (element.name === name) {
                return element.binding;
            }
        }

        throw new ShaderError(`no such uniform: ${name}`);
    }
}
