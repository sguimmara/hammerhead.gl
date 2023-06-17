import { BindGroups } from "@/core";
import AttributeType from "./AttributeType";
import ShaderError from "./ShaderError";
import ShaderInfo from "./ShaderInfo";
import UniformType from "./UniformType";
import constants from "./chunks/constants.wgsl";
import effectHeader from "./chunks/effect.header.wgsl";
import { AttributeInfo, ShaderLayout, UniformInfo } from "./ShaderLayout";

const UNIFORM_DECLARATION = /UNIFORM\((\w+)\s*,\s*(\w+|texture_2d<f32>)\)/g;
const ATTRIBUTE_DECLARATION = /ATTRIBUTE\((\w+)\s*,\s*(\w+)\)/g;

const chunks = new Map<string, string>();

const cachedShaderInfos = new Map<string, Map<string, ShaderInfo>>();

export class AttributeDeclaration {
    readonly text: string;
    readonly name: string;
    readonly type: AttributeType;
    location: number = undefined;

    constructor(declarationString: string, name: string, type: AttributeType) {
        this.text = declarationString;
        this.name = name;
        this.type = type;
    }

    toString(): string {
        if (this.location == null) {
            throw new ShaderError(`missing location for attribute "${this.name}"`);
        }

        const type = getString(this.type);
        return `@location(${this.location}) ${this.name} : ${type},`;
    }
}

export class UniformDeclaration {
    readonly text: string;
    readonly name: string;
    readonly type: UniformType;
    presentInVertexShader: boolean = false;
    presentInFragmentShader: boolean = false;
    binding: number = undefined;

    constructor(declarationString: string, name: string, type: UniformType) {
        this.text = declarationString;
        this.name = name;
        this.type = type;
    }

    toString(): string {
        if (this.binding == null) {
            throw new ShaderError(`missing binding for uniform "${this.name}"`);
        }

        const group = BindGroups.MaterialUniforms;
        const type = toUniformType(this.type);
        switch (this.type) {
            case UniformType.Texture2D:
            case UniformType.Sampler:
                return `@group(${group}) @binding(${this.binding}) var ${this.name} : ${type};`;
            default:
                return `@group(${group}) @binding(${this.binding}) var<uniform> ${this.name} : ${type};`;
        }
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
        case AttributeType.Vec2: return 'vec2f';
        case AttributeType.Vec3: return 'vec3f';
        case AttributeType.Vec4: return 'vec4f';
    }
}

function toUniformType(type: UniformType): string {
    switch (type) {
        case UniformType.Texture2D:
            return "texture_2d<f32>";
        case UniformType.Sampler:
            return "sampler";
        case UniformType.Vec2:
            return "vec2f";
        case UniformType.Vec3:
            return "vec3f";
        case UniformType.Vec4:
            return "vec4f";
        case UniformType.Mat4:
            return "mat4x4f";
        case UniformType.Float32:
            return "f32";
        case UniformType.GlobalValues:
            return "GlobalValues";
    }
}

function parseAttributeType(text: string): AttributeType {
    switch (text) {
        case "vec4f":
            return AttributeType.Vec4;
        case "vec3f":
            return AttributeType.Vec3;
        case "vec2f":
            return AttributeType.Vec2;
        default:
            throw new ShaderError(`invalid attribute type: ${text}`);
    }
}

function parseUniformType(text: string): UniformType {
    switch (text) {
        case "sampler":
            return UniformType.Sampler;
        case "f32":
            return UniformType.Float32;
        case "vec4f":
            return UniformType.Vec4;
        case "vec3f":
            return UniformType.Vec3;
        case "vec2f":
            return UniformType.Vec2;
        case "mat4x4f":
            return UniformType.Mat4;
        case "texture_2d<f32>":
            return UniformType.Texture2D;
        case "GlobalValues":
            return UniformType.GlobalValues;
        default:
            throw new ShaderError(`invalid uniform type: ${text}`);
    }
}

function getAttributeDeclarations(shaderCode: string): AttributeDeclaration[] {
    const declarations = shaderCode.matchAll(ATTRIBUTE_DECLARATION);

    const result: AttributeDeclaration[] = [];

    for (const decl of declarations) {
        const name = decl[1];
        const type = parseAttributeType(decl[2]);
        const text = decl[0];
        result.push(new AttributeDeclaration(text, name, type));
    }

    return result;
}

function getUniformDeclarations(shaderCode: string): UniformDeclaration[] {
    const declarations = shaderCode.matchAll(UNIFORM_DECLARATION);

    const result: UniformDeclaration[] = [];

    for (const decl of declarations) {
        const name = decl[1];
        const type = parseUniformType(decl[2]);
        const text = decl[0];
        result.push(new UniformDeclaration(text, name, type));
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
            throw new ShaderError(`duplicate uniform declaration: ${decl.name}`);
        }
        names.add(decl.name);
    }
}

function checkUniformDeclarations(vertexUniforms: UniformDeclaration[], fragmentUniforms: UniformDeclaration[]) {
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

function assignUniformBindings(vertexUniforms: UniformDeclaration[], fragmentUniforms: UniformDeclaration[]) {
    let currentBinding = 0;
    for (const vUniform of vertexUniforms) {
        for (const fUniform of fragmentUniforms) {
            if (fUniform.name === vUniform.name) {
                if (fUniform.type !== vUniform.type) {
                    throw new ShaderError(`uniform '${fUniform.name}' is present in both vertex and fragment shaders, but with different types.`);
                }

                fUniform.binding = vUniform.binding = currentBinding;
                fUniform.presentInVertexShader = true;
                vUniform.presentInFragmentShader = true;
                currentBinding++;
            }
        }
    }

    for (const uniform of vertexUniforms) {
        uniform.presentInVertexShader = true;
        if (uniform.binding == null) {
            uniform.binding = currentBinding++;
        }
    }

    for (const uniform of fragmentUniforms) {
        uniform.presentInFragmentShader = true;
        if (uniform.binding == null) {
            uniform.binding = currentBinding++;
        }
    }
}

function expandAttributeDeclarations(source: string, decls: AttributeDeclaration[]): string {
    let output = source;
    for (const decl of decls) {
        output = output.replace(decl.text, decl.toString());
    }
    return output;
}

function expandUniformDeclarations(source: string, decls: UniformDeclaration[]): string {
    let output = source;
    for (const decl of decls) {
        output = output.replace(decl.text, decl.toString());
    }
    return output;
}

function mergeUniformDeclarations(vs: UniformDeclaration[], fs: UniformDeclaration[]): UniformDeclaration[] {
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

    const processedFragment = expandUniformDeclarations(fragmentShader, fsDecls);
    let processedvertex = expandUniformDeclarations(vertexShader, vsDecls);
    processedvertex = expandAttributeDeclarations(processedvertex, attrs);

    const uniformDeclarations = mergeUniformDeclarations(vsDecls, fsDecls);

    const attributes = attrs.map(decl => new AttributeInfo(decl.location, decl.type, decl.name));
    const uniforms = uniformDeclarations
        .map(decl => new UniformInfo(BindGroups.MaterialUniforms, decl.binding, decl.type, decl.name));

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

setChunk("constants", constants);
setChunk("effectHeader", effectHeader);
