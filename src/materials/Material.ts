import Texture from "../textures/Texture";

let MATERIAL_ID = 0;

class Material {
    shaderCode: string;
    id: number;
    texture?: Texture;

    constructor(options : {
        shaderCode: string,
        texture?: Texture
    }) {
        this.id = MATERIAL_ID++;
        this.shaderCode = options.shaderCode;
        this.texture = options.texture;
    }

}

export default Material;
