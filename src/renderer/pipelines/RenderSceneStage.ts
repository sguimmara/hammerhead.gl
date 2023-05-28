import chroma, { Color } from "chroma-js";
import Stage from './Stage';

const DEFAULT_CLEAR_COLOR = chroma('black');

/**
 * A render pipeline stage that render the scene into a color attachment.
 */
class RenderSceneStage implements Stage {
    private clearColor: chroma.Color;
    private colorTarget: GPUTexture;
    private view: GPUTextureView;
    private colorAttachment: GPURenderPassColorAttachment;
    private renderPassDescriptor: GPURenderPassDescriptor;
    pass: GPURenderPassEncoder;

    constructor() {
        this.clearColor = DEFAULT_CLEAR_COLOR;
    }

    getPass(): GPURenderPassEncoder {
        return this.pass;
    }

    withClearColor(color: Color) {
        this.clearColor = color;
        return this;
    }

    withColorTarget(texture: GPUTexture) {
        if (this.colorTarget != texture) {
            this.colorTarget = texture;
            this.view = this.colorTarget.createView();
            this.colorAttachment = {
                view: this.view,
                clearValue: this.clearColor.gl(),
                loadOp: 'clear',
                storeOp: 'store'
            };
            this.renderPassDescriptor = {
                label: 'clear renderPass',
                colorAttachments: [this.colorAttachment],
            };
        }
        return this;
    }

    begin(encoder: GPUCommandEncoder) {
        this.pass = encoder.beginRenderPass(this.renderPassDescriptor);
        return this;
    }

    finish() {
        this.pass.end();
    }
}

export default RenderSceneStage;
