export enum VertexBufferSlot {
    Position,
    TexCoord,
    Color,
    Index,
    Normals,
}

export enum BindGroup {
    /**
     * Bind group for global values such as
     * elapsed time, target texture size...
     */
    GlobalValues = 0,
    /**
     * Bind group for material specific uniforms (colors, textures, etc.)
     */
    MaterialUniforms= 1,
    /**
     * Bind group for object specific uniforms (transform matrices...)
     */
    ObjectUniforms= 2,
    /**
     * Bind group for when mesh attributes are to be used as uniforms instead
     * of regular attributes (i.e vertex pulling.)
     */
    VertexBufferUniforms = 3,
}
