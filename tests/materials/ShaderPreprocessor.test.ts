import { BindGroups } from "@/core";
import { Attribute } from "@/geometries";
import {
    UniformType,
    AttributeType,
    ShaderPreprocessor as SPP,
} from "@/materials";
import {
    UniformDeclaration,
    AttributeDeclaration,
} from "@/materials/ShaderPreprocessor";
import { describe, expect, it } from "vitest";

function attrDecl(name: string, type: AttributeType, location: number) {
    const decl = new AttributeDeclaration("_unused_", name as Attribute, type);
    decl.location = location;

    return decl;
}

describe("AttributeDeclaration", () => {
    describe("toString", () => {
        it("should throw if no location is assigned", () => {
            const decl = attrDecl("foo", AttributeType.Vec2, undefined);

            expect(() => decl.toString()).toThrow(
                /missing location for attribute "foo"/
            );
        });

        describe("should return the correct string", () => {
            it("for vec2f", () => {
                const decl = attrDecl("foo", AttributeType.Vec2, 2);
                expect(decl.toString()).toEqual("@location(2) foo : vec2f,");
            });

            it("for vec3f", () => {
                const decl = attrDecl("bar", AttributeType.Vec3, 5);
                expect(decl.toString()).toEqual("@location(5) bar : vec3f,");
            });

            it("for vec4f", () => {
                const decl = attrDecl("baz", AttributeType.Vec4, 0);
                expect(decl.toString()).toEqual("@location(0) baz : vec4f,");
            });
        });
    });
});

describe("UniformDeclaration", () => {
    describe("toString", () => {
        it("should throw if no binding is assigned", () => {
            const decl = new UniformDeclaration({
                text: "",
                name: "foo",
                group: BindGroups.MaterialUniforms,
                qualifier: "var",
                type: UniformType.Float32,
            });

            expect(() => decl.toString()).toThrow(/missing binding/);
        });

        describe("should return the correct string", () => {
            it("for f32", () => {
                const decl = new UniformDeclaration({
                    text: "",
                    name: "bar",
                    group: BindGroups.MaterialUniforms,
                    qualifier: "var<uniform>",
                    type: UniformType.Float32,
                });
                decl.binding = 3;

                expect(decl.toString()).toEqual(
                    "@group(1) @binding(3) var<uniform> bar : f32;"
                );
            });

            it("for vec2f", () => {
                const decl = new UniformDeclaration({
                    text: "",
                    name: "foo",
                    group: BindGroups.MaterialUniforms,
                    qualifier: "var<uniform>",
                    type: UniformType.Vec2,
                });
                decl.binding = 5;

                expect(decl.toString()).toEqual(
                    "@group(1) @binding(5) var<uniform> foo : vec2f;"
                );
            });

            it("for vec3f", () => {
                const decl = new UniformDeclaration({
                    text: "",
                    name: "foo",
                    group: BindGroups.MaterialUniforms,
                    qualifier: "var<uniform>",
                    type: UniformType.Vec3,
                });
                decl.binding = 0;

                expect(decl.toString()).toEqual(
                    "@group(1) @binding(0) var<uniform> foo : vec3f;"
                );
            });

            it("for vec4f", () => {
                const decl = new UniformDeclaration({
                    text: "",
                    name: "baz",
                    group: BindGroups.MaterialUniforms,
                    qualifier: "var<uniform>",
                    type: UniformType.Vec4,
                });
                decl.binding = 11;

                expect(decl.toString()).toEqual(
                    "@group(1) @binding(11) var<uniform> baz : vec4f;"
                );
            });

            it("mat4x4f", () => {
                const decl = new UniformDeclaration({
                    text: "",
                    name: "myMatrix",
                    group: BindGroups.MaterialUniforms,
                    qualifier: "var<uniform>",
                    type: UniformType.Mat4,
                });
                decl.binding = 7;

                expect(decl.toString()).toEqual(
                    "@group(1) @binding(7) var<uniform> myMatrix : mat4x4f;"
                );
            });

            it("for texture", () => {
                const decl = new UniformDeclaration({
                    text: "",
                    name: "myTexture",
                    group: BindGroups.MaterialUniforms,
                    qualifier: "var",
                    type: UniformType.Texture2D,
                });
                decl.binding = 221;

                expect(decl.toString()).toEqual(
                    "@group(1) @binding(221) var myTexture : texture_2d<f32>;"
                );
            });

            it("for sampler", () => {
                const decl = new UniformDeclaration({
                    text: "",
                    name: "mySampler",
                    group: BindGroups.MaterialUniforms,
                    qualifier: "var",
                    type: UniformType.Sampler,
                });
                decl.binding = 12;

                expect(decl.toString()).toEqual(
                    "@group(1) @binding(12) var mySampler : sampler;"
                );
            });
        });
    });
});

describe("process", () => {
    it("should return the same object for the same shader code", () => {
        const vs = `
        struct Vertex {
            ATTRIBUTE(position, vec3f)
            ATTRIBUTE(texcoord, vec2f)
            ATTRIBUTE(color, vec4f)
        };

        UNIFORM(foo, f32)
        UNIFORM(bar, vec4f)
        UNIFORM(texture1, texture_2d<f32>)
        UNIFORM(globals, GlobalValues)

        do something with foo and bar
        `;

        const fs = `
        UNIFORM(baz, f32)
        UNIFORM(bar, vec4f)
        UNIFORM(mySampler, sampler)
        UNIFORM(myVec2, vec2f)

        do something with baz and bar
        `;

        const info1 = SPP.process(vs, fs);
        const info2 = SPP.process(vs, fs);

        expect(info1).toBe(info2);
    });

    it("should return the correct generated shader code", () => {
        const vs = `
        struct Vertex {
            ATTRIBUTE(position, vec3f)
            ATTRIBUTE(texcoord, vec2f)
            ATTRIBUTE(color, vec4f)
        };

        @group(material) @binding(auto) var<uniform> foo : f32;
        @group(material) @binding(auto) var<uniform> bar : vec4f;
        @group(material) @binding(auto) var texture1 : texture_2d<f32>;
        @group(global) @binding(auto) var<uniform> globals : GlobalValues;

        the vertex shader...
        `;

        const fs = `
        @group(material) @binding(auto) var<uniform> baz : f32;
        @group(material) @binding(auto) var<uniform> bar : vec4f;
        @group(material) @binding(auto) var mySampler : sampler;
        @group(material) @binding(auto) var<uniform> myVec2 : vec2f;

        the fragment shader...
        `;

        const result = SPP.process(vs, fs);

        const expectedVs = `
        struct Vertex {
            @location(0) position : vec3f,
            @location(1) texcoord : vec2f,
            @location(2) color : vec4f,
        };

        @group(1) @binding(1) var<uniform> foo : f32;
        @group(1) @binding(0) var<uniform> bar : vec4f;
        @group(1) @binding(2) var texture1 : texture_2d<f32>;
        @group(0) @binding(0) var<uniform> globals : GlobalValues;

        the vertex shader...
        `;
        const expectedFs = `
        @group(1) @binding(3) var<uniform> baz : f32;
        @group(1) @binding(0) var<uniform> bar : vec4f;
        @group(1) @binding(4) var mySampler : sampler;
        @group(1) @binding(5) var<uniform> myVec2 : vec2f;

        the fragment shader...
        `;
        expect(result.vertex.trim()).toEqual(expectedVs.trim());
        expect(result.fragment.trim()).toEqual(expectedFs.trim());

        const attributes = result.layout.attributes;
        expect(attributes.length).toEqual(3);

        expect(attributes[0].location).toEqual(0);
        expect(attributes[0].name).toEqual("position");
        expect(attributes[0].type).toEqual(AttributeType.Vec3);

        expect(attributes[1].location).toEqual(1);
        expect(attributes[1].name).toEqual("texcoord");
        expect(attributes[1].type).toEqual(AttributeType.Vec2);

        expect(attributes[2].location).toEqual(2);
        expect(attributes[2].name).toEqual("color");
        expect(attributes[2].type).toEqual(AttributeType.Vec4);

        const uniforms = result.layout.uniforms;
        expect(uniforms.length).toEqual(7);

        function find(name: string) {
            return uniforms.find(u => u.name === name);
        }

        const bar = find('bar');
        expect(bar.binding).toEqual(0);
        expect(bar.type).toEqual(UniformType.Vec4);

        const foo = find('foo');
        expect(foo.binding).toEqual(1);
        expect(foo.type).toEqual(UniformType.Float32);

        const texture1 = find('texture1');
        expect(texture1.binding).toEqual(2);
        expect(texture1.type).toEqual(UniformType.Texture2D);

        const globals = find('globals');
        expect(globals.binding).toEqual(0);
        expect(globals.type).toEqual(UniformType.GlobalValues);

        const baz = find('baz');
        expect(baz.binding).toEqual(3);
        expect(baz.type).toEqual(UniformType.Float32);

        const mySampler = find('mySampler');
        expect(mySampler.binding).toEqual(4);
        expect(mySampler.type).toEqual(UniformType.Sampler);

        const myVec2 = find('myVec2');
        expect(myVec2.binding).toEqual(5);
        expect(myVec2.type).toEqual(UniformType.Vec2);
    });
});

describe("getAttributeDeclarations", () => {
    it("should throw if the type is invalid", () => {
        expect(() =>
            SPP.getAttributeDeclarations("ATTRIBUTE(position, nope)")
        ).toThrow(/invalid attribute type: nope/);
    });

    it("should return the correct value", () => {
        const code = `
        ATTRIBUTE(position, vec3f)
        ATTRIBUTE(texcoord, vec2f)
        ATTRIBUTE(color, vec4f)
        `;

        const result = SPP.getAttributeDeclarations(code);

        expect(result.length).toEqual(3);

        const position = result[0];
        expect(position.name).toEqual("position");
        expect(position.type).toEqual(AttributeType.Vec3);

        const texcoord = result[1];
        expect(texcoord.name).toEqual("texcoord");
        expect(texcoord.type).toEqual(AttributeType.Vec2);

        const color = result[2];
        expect(color.name).toEqual("color");
        expect(color.type).toEqual(AttributeType.Vec4);
    });
});

describe("getUniformDeclarations", () => {
    it("should return the correct values", () => {
        const code = `
        @group(material) @binding(auto) var foo : f32;
        @group(material) @binding(auto) var bar: vec4f;
        @group(material) @binding(auto) var baz:vec3f;
        @group(material) @binding(auto) var quux :  mat4x4f;
        `;

        const result = SPP.getUniformDeclarations(code);

        expect(result.length).toEqual(4);

        const foo = result[0];
        expect(foo.name).toEqual("foo");
        expect(foo.type).toEqual(UniformType.Float32);
        expect(foo.text).toEqual("@group(material) @binding(auto) var foo : f32;");

        const bar = result[1];
        expect(bar.name).toEqual("bar");
        expect(bar.type).toEqual(UniformType.Vec4);
        expect(bar.text).toEqual("@group(material) @binding(auto) var bar: vec4f;");

        const baz = result[2];
        expect(baz.name).toEqual("baz");
        expect(baz.type).toEqual(UniformType.Vec3);
        expect(baz.text).toEqual("@group(material) @binding(auto) var baz:vec3f;");

        const qux = result[3];
        expect(qux.name).toEqual("quux");
        expect(qux.type).toEqual(UniformType.Mat4);
        expect(qux.text).toEqual("@group(material) @binding(auto) var quux :  mat4x4f;");
    });
});

describe("checkUniformDeclarations", () => {
    it("should throw if two uniforms have the same name in the same shader", () => {
        const decl0 = new UniformDeclaration({ text: "_unused_", name: "foo", group: BindGroups.MaterialUniforms, qualifier: 'var', type: UniformType.Vec2 });
        const decl1 = new UniformDeclaration({ text: "_unused_", name: "foo", group: BindGroups.MaterialUniforms, qualifier: 'var', type: UniformType.Float32 });

        const decls = [decl0, decl1];

        expect(() => SPP.checkUniformDeclarations(decls, [])).toThrowError(
            /duplicate uniform declaration: foo/
        );

        expect(() => SPP.checkUniformDeclarations([], decls)).toThrowError(
            /duplicate uniform declaration: foo/
        );
    });
});

describe("setChunk", () => {
    it("should throw if chunk is already present", () => {
        const chunk = "foo";
        SPP.setChunk("fooChunk", chunk);
        expect(() => SPP.setChunk("fooChunk", chunk)).toThrow(
            /chunk already present: fooChunk/
        );
    });
});

describe("getChunk", () => {
    it("should return a chunk that has been set", () => {
        SPP.setChunk("myChunk", "hello");

        expect(SPP.getChunk("myChunk")).toEqual("hello");
    });

    it("should return undefined if no chunk is present with the specified key", () => {
        expect(SPP.getChunk("nope")).toBeUndefined();
    });
});

describe("assignAttributeLocations", () => {
    it("should throw if two attributes have the same name", () => {
        const attrs = [
            attrDecl("foo", AttributeType.Vec2, undefined),
            attrDecl("foo", AttributeType.Vec2, undefined),
        ];

        expect(() => SPP.assignAttributeLocations(attrs)).toThrow(
            /duplicate attribute: foo/
        );
    });

    it("should assign different locations to different attributes", () => {
        const attrs = [
            attrDecl("foo", AttributeType.Vec2, undefined),
            attrDecl("bar", AttributeType.Vec2, undefined),
            attrDecl("baz", AttributeType.Vec2, undefined),
            attrDecl("qux", AttributeType.Vec2, undefined),
        ];

        SPP.assignAttributeLocations(attrs);

        expect(attrs[0].location).toEqual(0);
        expect(attrs[1].location).toEqual(1);
        expect(attrs[2].location).toEqual(2);
        expect(attrs[3].location).toEqual(3);
    });
});

describe("assignUniformBindings", () => {
    it("should throw if two uniforms from both shaders have the same name but not the same type", () => {
        const vertexUniforms = [
            new UniformDeclaration({ text: "_unused_", name: "shared", group: BindGroups.MaterialUniforms, qualifier: 'var', type: UniformType.Vec3 }),
        ];

        const fragmentUniforms = [
            new UniformDeclaration({ text: "_unused_", name: "shared", group: BindGroups.MaterialUniforms, qualifier: 'var', type: UniformType.Vec2 }),
        ];

        expect(() =>
            SPP.assignUniformBindings(vertexUniforms, fragmentUniforms)
        ).toThrowError(/uniform 'shared' is present in both/);
    });

    it("should assign the same binding to shared uniforms", () => {
        const vertexUniforms = [
            new UniformDeclaration({ text: "_unused_", name: "uniqueA", group: BindGroups.MaterialUniforms, qualifier: 'var', type: UniformType.Vec3 }),
            new UniformDeclaration({ text: "_unused_", name: "shared", group: BindGroups.MaterialUniforms, qualifier: 'var', type: UniformType.Vec2 }),
        ];

        const fragmentUniforms = [
            new UniformDeclaration({ text: "_unused_", name: "uniqueB", group: BindGroups.MaterialUniforms, qualifier: 'var', type: UniformType.Mat4 }),
            new UniformDeclaration({ text: "_unused_", name: "shared", group: BindGroups.MaterialUniforms, qualifier: 'var', type: UniformType.Vec2 }),
        ];

        SPP.assignUniformBindings(vertexUniforms, fragmentUniforms);

        expect(vertexUniforms[0].binding).toEqual(1);
        expect(vertexUniforms[0].presentInVertexShader).toEqual(true);
        expect(vertexUniforms[0].presentInFragmentShader).toEqual(false);

        // Shared uniforms
        expect(fragmentUniforms[1].binding).toEqual(0);
        expect(fragmentUniforms[1].presentInFragmentShader).toEqual(true);
        expect(fragmentUniforms[1].presentInVertexShader).toEqual(true);
        expect(vertexUniforms[1].binding).toEqual(0);
        expect(vertexUniforms[1].presentInFragmentShader).toEqual(true);
        expect(vertexUniforms[1].presentInVertexShader).toEqual(true);

        expect(fragmentUniforms[0].binding).toEqual(2);
        expect(fragmentUniforms[0].presentInFragmentShader).toEqual(true);
        expect(fragmentUniforms[0].presentInVertexShader).toEqual(false);
    });
});
