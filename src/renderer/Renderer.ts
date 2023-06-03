import chroma from "chroma-js";
import Container from "../core/Container";
import PostProcessingMaterial from "../materials/postprocessing/PostProcessingMaterial";
import Mesh from "../objects/Mesh";
import Object3D from "../objects/Object3D";
import RenderPipeline from "./RenderPipeline";
import Camera from '../objects/Camera';
import RenderCommand from "./RenderCommand";
import Bucket from "./Bucket";

const DEFAULT_CLEAR_COLOR = chroma('black');

const tmpBuckets : Map<number, Bucket> = new Map();

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

    private getRenderBuckets(graph: Object3D): Bucket[] {
        if (graph) {
            tmpBuckets.forEach(b => b.meshes.length = 0);
            graph.traverse(obj => {
                obj.transform.updateWorldMatrix(obj.parent?.transform);
                const mesh = obj as Mesh;
                if (mesh.isMesh) {
                    const material = mesh.material;
                    if (material && material.active) {
                        let bucket = tmpBuckets.get(material.renderOrder);
                        if (!bucket) {
                            bucket = new Bucket();
                            bucket.meshes = [mesh];
                            tmpBuckets.set(material.renderOrder, bucket);
                        } else {
                            bucket.meshes.push(mesh);
                        }
                    }
                }
            });

            const result: Bucket[] = [];
            tmpBuckets.forEach(b => {
                if (b.meshes.length > 0) {
                    result.push(b);
                    // Sort by material to reduce pipeline switches
                    b.meshes.sort((a, b) => a.material.id - b.material.id);
                }
            });

            result.sort((a, b) => a.order - b.order);
            return result;
        }

        return [];
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
        const buckets = this.getRenderBuckets(root);
        const command = new RenderCommand({
            camera,
            buckets,
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