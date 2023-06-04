import ShaderPreprocessor from '../../src/materials/ShaderPreprocessor';

describe('process', () => {
    it('should include chunks', async () => {
        const shaderCode = `
            #chunk foo
            #chunk bar
        `;

        ShaderPreprocessor.setChunk('foo', 'hello foo');
        ShaderPreprocessor.setChunk('bar', 'hello bar');

        const output = ShaderPreprocessor.process(shaderCode);

        expect(output).toEqual(`
            hello foo
            hello bar
        `);
    });
});