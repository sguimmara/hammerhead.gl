let MATERIAL_ID = 0;

class Material {
    shaderCode: string;
    id: number;

    constructor(options : {
        shaderCode: string,
    }) {
        this.id = MATERIAL_ID++;
        this.shaderCode = options.shaderCode;
    }
}

export default Material;
