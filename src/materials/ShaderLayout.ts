import { BindGroup } from "@/core";
import ShaderError from "./ShaderError";
import UniformType from "./UniformType";
import AttributeType from "./AttributeType";
import { Attribute } from "@/geometries";
import { Uniform } from "./uniforms";

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

export class ShaderLayout {
    readonly uniforms: UniformInfo[];
    readonly attributes: AttributeInfo[];

    constructor(attributes: AttributeInfo[], uniforms: UniformInfo[]) {
        this.attributes = attributes;
        this.uniforms = uniforms;
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
        const array = this.uniforms;
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            if (element.group === group) {
                return true;
            }
        }

        return false;
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
