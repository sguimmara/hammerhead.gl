import { BindGroup } from '@/core';
import AttributeType from './AttributeType';
import ShaderError from './ShaderError';
import ShaderInfo from './ShaderInfo';
import UniformType from './UniformType';
import constants from './chunks/constants.wgsl';
import effectHeader from './chunks/effect.header.wgsl';
import { AttributeInfo, ShaderLayout, UniformInfo } from './ShaderLayout';
import { Attribute } from '@/geometries';

const UNIFORM_DECLARATION = /@group\((global|object|material|vertex)\)\s*@binding\(auto\)\s*(var|var<uniform>|var<storage,\s*read>)\s*(\w+)\s*:\s*(mat4x4f|vec2f|vec3f|vec4f|f32|u32|array<(u32|f32)>|sampler|texture_2d<f32>|GlobalValues)\s*;/g;
const ATTRIBUTE_DECLARATION = /@location\(auto\)\s*(\w+)\s*:\s*(\w+)/g;

const chunks = new Map<string, string>();

const cachedShaderInfos = new Map<string, Map<string, ShaderInfo>>();

export class AttributeDeclaration {
    readonly text: string;
    readonly name: Attribute;
    readonly type: AttributeType;
    location: number = undefined;

    constructor(declarationString: string, name: Attribute, type: AttributeType) {
        this.text = declarationString;
        this.name = name;
        this.type = type;
    }

    toString(): string {
        if (this.location == null) {
            throw new ShaderError(
                `missing location for attribute "${this.name}"`
            );
        }

        const type = getString(this.type);
        return `@location(${this.location}) ${this.name} : ${type}`;
    }
}

export class UniformDeclaration {
    readonly text: string;
    readonly name: string;
    readonly type: UniformType;
    presentInVertexShader: boolean = false;
    presentInFragmentShader: boolean = false;
    binding: number = undefined;
    readonly group: BindGroup;
    readonly qualifier: string;

    constructor(params: { text: string, group: BindGroup, qualifier: string, name: string, type: UniformType }) {
        this.text = params.text;
        this.name = params.name;
        this.type = params.type;
        this.group = params.group;
        this.qualifier = params.qualifier;
    }

    toString(): string {
        if (this.binding == null) {
            throw new ShaderError(`missing binding for uniform "${this.name}"`);
        }

        const type = toUniformType(this.type);
        return `@group(${this.group}) @binding(${this.binding}) ${this.qualifier} ${this.name} : ${type};`;
    }
}

function setChunk(key: string, shaderCode: string) {
    if (chunks.has(key)) {
        throw new Error(`chunk already present: ${key}`);
    }

    chunks.set(key, shaderCode);
}

function getChunk(key: string): string {
    return chunks.get(key);
}

function getString(type: AttributeType): string {
    switch (type) {
        case AttributeType.Vec2:
            return 'vec2f';
        case AttributeType.Vec3:
            return 'vec3f';
        case AttributeType.Vec4:
            return 'vec4f';
    }
}

function toUniformType(type: UniformType): string {
    switch (type) {
        case UniformType.Texture2D:
            return 'texture_2d<f32>';
        case UniformType.Sampler:
            return 'sampler';
        case UniformType.Vec2:
            return 'vec2f';
        case UniformType.Vec3:
            return 'vec3f';
        case UniformType.Vec4:
            return 'vec4f';
        case UniformType.Mat4:
            return 'mat4x4f';
        case UniformType.Float32:
            return 'f32';
        case UniformType.GlobalValues:
            return 'GlobalValues';
        case UniformType.U32Array:
            return 'array<u32>';
        case UniformType.F32Array:
            return 'array<f32>';
        default:
            throw new ShaderError('unimplemented uniform type');
    }
}

function parseAttributeType(text: string): AttributeType {
    switch (text) {
        case 'vec4f':
            return AttributeType.Vec4;
        case 'vec3f':
            return AttributeType.Vec3;
        case 'vec2f':
            return AttributeType.Vec2;
        default:
            throw new ShaderError(`invalid attribute type: ${text}`);
    }
}

function parseUniformType(text: string): UniformType {
    switch (text) {
        case 'sampler':
            return UniformType.Sampler;
        case 'array<f32>':
            return UniformType.F32Array;
        case 'array<u32>':
            return UniformType.U32Array;
        case 'f32':
            return UniformType.Float32;
        case 'vec4f':
            return UniformType.Vec4;
        case 'vec3f':
            return UniformType.Vec3;
        case 'vec2f':
            return UniformType.Vec2;
        case 'mat4x4f':
            return UniformType.Mat4;
        case 'texture_2d<f32>':
            return UniformType.Texture2D;
        case 'GlobalValues':
            return UniformType.GlobalValues;
        default:
            throw new ShaderError(`invalid uniform type: ${text}`);
    }
}

function validateAttribute(name: string): Attribute {
    switch (name as Attribute) {
        case 'position':
        case 'normal':
        case 'texcoord':
        case 'texcoord1':
        case 'texcoord2':
        case 'tangent':
        case 'color':
            return name as Attribute;
        default:
            throw new ShaderError(`unrecognized attribute name: ${name}`);
    }
}

function getAttributeDeclarations(shaderCode: string): AttributeDeclaration[] {
    const declarations = shaderCode.matchAll(ATTRIBUTE_DECLARATION);

    const result: AttributeDeclaration[] = [];

    for (const decl of declarations) {
        const name = validateAttribute(decl[1]);
        const type = parseAttributeType(decl[2]);
        const text = decl[0];
        result.push(new AttributeDeclaration(text, name, type));
    }

    return result;
}

function parseGroup(text: string): BindGroup {
    switch (text) {
        case 'object': return BindGroup.ObjectUniforms;
        case 'material': return BindGroup.MaterialUniforms;
        case 'global': return BindGroup.GlobalValues;
        case 'vertex': return BindGroup.VertexBufferUniforms;
        default:
            throw new ShaderError(`unrecognized group: ${text}`);
    }
}

function getUniformDeclarations(shaderCode: string): UniformDeclaration[] {
    const declarations = shaderCode.matchAll(UNIFORM_DECLARATION);

    const result: UniformDeclaration[] = [];

    for (const decl of declarations) {
        const text = decl[0];
        const group = parseGroup(decl[1]);
        const qualifier = decl[2];
        const name = decl[3];
        const type = parseUniformType(decl[4]);
        result.push(new UniformDeclaration({ text: text, group, qualifier, name, type }));
    }

    return result;
}

function checkDuplicateNames(declarations: UniformDeclaration[]) {
    if (declarations.length === 0) {
        return;
    }

    const names = new Set<string>();
    for (const decl of declarations) {
        if (names.has(decl.name)) {
            throw new ShaderError(
                `duplicate uniform declaration: ${decl.name}`
            );
        }
        names.add(decl.name);
    }
}

function checkUniformDeclarations(
    vertexUniforms: UniformDeclaration[],
    fragmentUniforms: UniformDeclaration[]
) {
    checkDuplicateNames(vertexUniforms);
    checkDuplicateNames(fragmentUniforms);
}

function assignAttributeLocations(attributes: AttributeDeclaration[]) {
    let currentLocation = 0;
    const names = new Set<string>();

    for (const attr of attributes) {
        if (names.has(attr.name)) {
            throw new ShaderError(`duplicate attribute: ${attr.name}`);
        }

        names.add(attr.name);
        attr.location = currentLocation++;
    }
}

function assignUniformBindings(
    vertexUniforms: UniformDeclaration[],
    fragmentUniforms: UniformDeclaration[]
) {
    const bindings = new Map<BindGroup, number>();
    bindings.set(BindGroup.GlobalValues, 0);
    bindings.set(BindGroup.MaterialUniforms, 0);
    bindings.set(BindGroup.VertexBufferUniforms, 0);
    bindings.set(BindGroup.ObjectUniforms, 0);
    for (const vUniform of vertexUniforms) {
        for (const fUniform of fragmentUniforms) {
            if (fUniform.name === vUniform.name) {
                if (fUniform.type !== vUniform.type) {
                    throw new ShaderError(
                        `uniform '${fUniform.name}' is present in both vertex and fragment shaders, but with different types.`
                    );
                }

                const currentBinding = bindings.get(vUniform.group);
                fUniform.binding = vUniform.binding =  currentBinding;
                fUniform.presentInVertexShader = true;
                vUniform.presentInFragmentShader = true;
                bindings.set(vUniform.group, currentBinding + 1);
            }
        }
    }

    for (const uniform of vertexUniforms) {
        uniform.presentInVertexShader = true;
        if (uniform.binding == null) {
            uniform.binding = bindings.get(uniform.group);
            bindings.set(uniform.group, uniform.binding + 1);
        }
    }

    for (const uniform of fragmentUniforms) {
        uniform.presentInFragmentShader = true;
        if (uniform.binding == null) {
            uniform.binding = bindings.get(uniform.group);
            bindings.set(uniform.group, uniform.binding + 1);
        }
    }
}

function expandAttributeDeclarations(
    source: string,
    decls: AttributeDeclaration[]
): string {
    let output = source;
    for (const decl of decls) {
        output = output.replace(decl.text, decl.toString());
    }
    return output;
}

function expandUniformDeclarations(
    source: string,
    decls: UniformDeclaration[]
): string {
    let output = source;
    for (const decl of decls) {
        output = output.replace(decl.text, decl.toString());
    }
    return output;
}

function mergeUniformDeclarations(
    vs: UniformDeclaration[],
    fs: UniformDeclaration[]
): UniformDeclaration[] {
    const map = new Map<string, UniformDeclaration>();

    for (const decl of vs) {
        if (!map.has(decl.name)) {
            map.set(decl.name, decl);
        }
    }

    for (const decl of fs) {
        if (!map.has(decl.name)) {
            map.set(decl.name, decl);
        }
    }

    return Array.from(map.values()).sort((a, b) => a.binding - b.binding);
}

function process(vertexShader: string, fragmentShader: string): ShaderInfo {
    let cacheMap = cachedShaderInfos.get(vertexShader);
    if (cacheMap) {
        const cached = cacheMap.get(fragmentShader);
        if (cached) {
            return cached;
        }
    }

    const result = doProcess(vertexShader, fragmentShader);

    if (!cacheMap) {
        cacheMap = new Map<string, ShaderInfo>();
        cachedShaderInfos.set(vertexShader, cacheMap);
    }

    cacheMap.set(fragmentShader, result);

    return result;
}

function doProcess(vertexShader: string, fragmentShader: string): ShaderInfo {
    const vsDecls = getUniformDeclarations(vertexShader);
    const fsDecls = getUniformDeclarations(fragmentShader);

    const attrs = getAttributeDeclarations(vertexShader);

    checkUniformDeclarations(vsDecls, fsDecls);

    assignUniformBindings(vsDecls, fsDecls);
    assignAttributeLocations(attrs);

    const processedFragment = expandUniformDeclarations(
        fragmentShader,
        fsDecls
    );
    let processedvertex = expandUniformDeclarations(vertexShader, vsDecls);
    processedvertex = expandAttributeDeclarations(processedvertex, attrs);

    const uniformDeclarations = mergeUniformDeclarations(vsDecls, fsDecls);

    const attributes = attrs.map(
        (decl) => new AttributeInfo(decl.location, decl.type, decl.name)
    );
    const uniforms = uniformDeclarations.map(
        (decl) =>
            new UniformInfo(
                decl.group,
                decl.binding,
                decl.type,
                decl.name,
                decl.presentInVertexShader,
                decl.presentInFragmentShader,
            )
    );

    const layout = new ShaderLayout(attributes, uniforms);

    return new ShaderInfo({
        fragment: processedFragment,
        vertex: processedvertex,
        layout,
    });
}

export default {
    setChunk,
    getChunk,
    process,
    getUniformDeclarations,
    getAttributeDeclarations,
    assignUniformBindings,
    assignAttributeLocations,
    checkUniformDeclarations,
};

setChunk('constants', constants);
setChunk('effectHeader', effectHeader);
