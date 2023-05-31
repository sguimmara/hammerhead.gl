import { BindGroups } from '../constants';
import UniformType from './UniformType';

class LayoutInfo {
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

export default LayoutInfo;
