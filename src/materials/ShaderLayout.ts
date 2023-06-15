import { BindGroups } from "@/core";
import ShaderError from "./ShaderError";
import UniformType from "./UniformType";
import AttributeType from "./AttributeType";

export class UniformInfo {
    readonly binding: number;
    readonly type: UniformType;
    readonly group: BindGroups;
    readonly name: string;

    constructor(
        group: BindGroups,
        binding: number,
        type: UniformType,
        name: string
    ) {
        this.name = name;
        this.group = group;
        this.binding = binding;
        this.type = type;
    }
}

export class AttributeInfo {
    readonly location: number;
    readonly type: AttributeType;
    readonly name: string;

    constructor(location: number, type: AttributeType, name: string) {
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

    getAttributeLocation(name: string): number {
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
