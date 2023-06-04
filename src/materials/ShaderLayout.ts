import { BindGroups } from "../core/constants";

export class UniformInfo {
    readonly binding: number;
    readonly type: UniformType;
    readonly group: BindGroups;
    readonly name: string;

    constructor(group: BindGroups, binding: number, type: UniformType, name: string) {
        this.name = name;
        this.group = group;
        this.binding = binding;
        this.type = type;
    }
}

export enum UniformType {
    Texture2D,
    Sampler,
    Vec2,
    Vec3,
    Vec4,
    Mat4,
    Scalar,
    GlobalValues
}

export enum AttributeType {
    Vec2,
    Vec3,
    Vec4,
}

export class AttributeInfo {
    readonly location: number;
    readonly type: AttributeType;

    constructor(location: number, type: AttributeType) {
        this.location = location;
        this.type = type;
    }
}

export class ShaderLayout {
    readonly uniforms: UniformInfo[];
    readonly attributes: AttributeInfo[];

    constructor(attributes: AttributeInfo[], uniforms: UniformInfo[]) {
        this.attributes = attributes;
        this.uniforms = uniforms;
    }

    static parse(fragmentShader: string, vertexShader: string): ShaderLayout {
        const uniforms = parseUniforms(fragmentShader);
        const attributes = getAttributes(vertexShader);
        return new ShaderLayout(attributes, uniforms);
    }
}

function getAttributes(shaderCode: string): AttributeInfo[] {
    // struct Vertex {
    //     @location(0) position: vec3f,
    //     @location(1) texcoord: vec2f,
    // };
    const structRegex = /struct Vertex\s*\{[^]*?\};/;
    const match = shaderCode.match(structRegex);
    if (match) {
        const struct = match[0];
        const attrRegex = /@location\((\d+)\)\s*(\w+)\s*:\s*(\w+)/;
        const lines = struct.split("\n");
        const result: AttributeInfo[] = [];
        for (const line of lines) {
            const match = line.match(attrRegex);
            if (match) {
                const location = Number.parseInt(match[1]);
                const type = match[3];
                let attrType;
                switch (type) {
                    case 'vec2f':
                        attrType = AttributeType.Vec2;
                        break;
                    case 'vec3f':
                        attrType = AttributeType.Vec3;
                        break;
                    case 'vec4f':
                        attrType = AttributeType.Vec4;
                        break;
                    default: throw new ShaderError(`invalid attribute type: ${type}`);
                }

                result.push(new AttributeInfo(location, attrType));
            }
        }

        return result;
    }

    throw new ShaderError('no vertex attribute found');
}

function parseUniformType(text: string): UniformType {
    switch (text) {
        case "sampler":
            return UniformType.Sampler;
        case "f32":
            return UniformType.Scalar;
        case "vec4f":
            return UniformType.Vec4;
        case "vec3f":
            return UniformType.Vec3;
        case "vec2f":
            return UniformType.Vec2;
        case "mat4x4f":
            return UniformType.Mat4;
        case "texture_2d":
            return UniformType.Texture2D;
        case "GlobalValues":
            return UniformType.GlobalValues;
        default:
            throw new ShaderError(`invalid uniform type: ${text}`);
    }
}

class ShaderError extends Error {
    constructor(message: string) {
        super(message);
    }
}

function parseGroup(text: string): number {
    switch (text) {
        case "GLOBAL_UNIFORMS":
            return BindGroups.GlobalValues;
        case "MATERIAL_UNIFORMS":
            return BindGroups.MaterialUniforms;
        case "OBJECT_UNIFORMS":
            return BindGroups.ObjectUniforms;
        default:
            throw new ShaderError(`invalid group: ${text}`);
    }
}

function parseUniforms(shaderCode: string): UniformInfo[] {
    const bindingRegex =
        /^\s*@group\((GLOBAL_UNIFORMS|MATERIAL_UNIFORMS|OBJECT_UNIFORMS)\)\s*@binding\((\d+)\)\s*var(<uniform>)?\s*(\w+)\s*:\s*(\w+)(<f32>)?\s*;\s*$/;
    const lines = shaderCode.split("\n");
    const result = [];
    for (const line of lines) {
        const match = line.match(bindingRegex);
        if (match) {
            const groupMatch = match[1];
            const bindingMatch = match[2];
            const name = match[4];
            const typeGroup = match[5];

            const group = parseGroup(groupMatch);
            const binding = Number.parseInt(bindingMatch);
            if (binding < 0) {
                throw new ShaderError(`invalid binding: ${group}`);
            }
            const type = parseUniformType(typeGroup);

            const info = new UniformInfo(group, binding, type, name);

            // TODO we ignore the global binding for now
            if (group === BindGroups.MaterialUniforms) {
                result.push(info);
            }
        }
    }

    return result;
}
