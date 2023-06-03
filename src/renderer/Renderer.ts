import chroma from "chroma-js";
import Container from "../core/Container";
import PostProcessingMaterial from "../materials/postprocessing/PostProcessingMaterial";
import Mesh from "../objects/Mesh";
import Object3D from "../objects/Object3D";
import RenderPipeline from "./RenderPipeline";
import Camera from '../objects/Camera';
import RenderCommand from "./RenderCommand";
import { mat4 } from "wgpu-matrix";

const DEFAULT_CLEAR_COLOR = chroma('black');

class WebGPURenderer {
    private readonly device: GPUDevice;
    private readonly context: GPUCanvasContext;

    private renderPipeline: RenderPipeline;

    /** The clear color. */
    clearColor: chroma.Color = DEFAULT_CLEAR_COLOR;

    constructor(device: GPUDevice, context: GPUCanvasContext, container: Container) {
        this.device = device;
        this.context = context;

        this.renderPipeline = new RenderPipeline(this.device, container);
    }

    private getMeshes(graph: Object3D): { opaque: Mesh[] } {
        const opaque: Mesh[] = [];

        if (graph) {
            graph.traverse(obj => {
                // TODO scene graph matrix transformations
                mat4.copy(obj.localMatrix, obj.worldMatrix);
                const mesh = obj as Mesh;
                if (mesh.isMesh) {
                    if (mesh.material && mesh.material.active) {
                        // TODO transparent queue
                        opaque.push(mesh);
                    }
                }
            });
        }

        return { opaque };
    }

    /**
     * Renders a scene graph.
     * @param root The root of the object graph to render. If unspecified, the rendered result is
     * simply the clear color and optional post-processing effects.
     * @param camera The camera to render.
     */
    render(root: Object3D | null, camera: Camera) {
        if (!camera) {
            throw new Error('no camera specified');
        }

        this.renderPipeline.setClearColor(this.clearColor);
        const { opaque } = this.getMeshes(root);
        const command = new RenderCommand({
            camera,
            opaqueList: opaque,
            target: this.context.getCurrentTexture(),
        })
        this.renderPipeline.render(command);
    }

    /**
     * Specifies the render stages of the post-processing pipeline.
     * @param stages The stages, in first-to-last order. If unspecified, this simply removes
     * all post-processing stages.
     */
    setRenderStages(stages?: PostProcessingMaterial[]) {
        this.renderPipeline.resetPipeline();
        if (stages) {
            for (const material of stages) {
                this.renderPipeline.addStage(material);
            }
        }
    }

    destroy() {
        this.renderPipeline.destroy();
    }
}

export default WebGPURenderer;