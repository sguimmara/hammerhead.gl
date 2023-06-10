import constants from './chunks/constants.wgsl';
import effectHeader from './chunks/effect.header.wgsl';

const chunks = new Map<string, string>();

function setChunk(key: string, shaderCode: string) {
    if (chunks.has(key)) {
        throw new Error('chunks already present');
    }

    chunks.set(key, shaderCode);
}

function getChunk(key: string): string {
    return chunks.get(key);
}

export default {
    setChunk,
    getChunk,
}

setChunk('constants', constants);
setChunk('effectHeader', effectHeader);
