import UniformType from './UniformType';

class LayoutInfo {
    readonly slot: number;
    readonly type: UniformType;

    constructor(slot: number, type: UniformType) {
        this.slot = slot;
        this.type = type;
    }
}

export default LayoutInfo;
