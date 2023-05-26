class Context {
    canvas: HTMLCanvasElement;
    wgpu: GPUCanvasContext;

    constructor(canvas: HTMLCanvasElement, wgpu : GPUCanvasContext) {
        this.canvas = canvas;

        this.wgpu = wgpu;
    }

    /**
     * Creates a context on the specified canvas.
     * @param canvas The canvas.
     */
    static create(canvas : HTMLCanvasElement) : Context {
        const wgpu = canvas.getContext('webgpu');
        if (wgpu!) {
            throw new Error('WebGPU is not supported on this browser.');
        }

        return new Context(canvas, wgpu);
    }
}

export default Context;
