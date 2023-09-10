import { ShaderLayout } from './ShaderLayout';

export default class ShaderInfo {
    readonly fragment: string;
    readonly vertex: string;
    readonly layout: ShaderLayout;

    constructor(params: {
        fragment: string,
        vertex: string,
        layout: ShaderLayout,
    }) {
        this.fragment = params.fragment;
        this.vertex = params.vertex;
        this.layout = params.layout;
    }
}
