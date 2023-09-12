import chroma from 'chroma-js';

import Bucket from './Bucket';
import RenderCommand from './RenderCommand';
import RenderPipeline from './RenderPipeline';
import { Container } from '@core';
import { PostProcessingMaterial } from '@materials/postprocessing';
import { Node, Camera } from '@scene';

const DEFAULT_CLEAR_COLOR = chroma('black');

const tmpBuckets: Map<number, Bucket> = new Map();

/**
 * The WebGPU renderer.
 */
class Renderer {
    private readonly device: GPUDevice;
    private readonly context: GPUCanvasContext;

    private _frameCount: number = 0;

    private renderPipeline: RenderPipeline;
    private _destroyed: boolean = false;

    /** The clear color. */
    clearColor: chroma.Color = DEFAULT_CLEAR_COLOR;

    get destroyed() {
        return this._destroyed;
    }

    get frameCount() {
        return this._frameCount;
    }

    constructor(
        device: GPUDevice,
        context: GPUCanvasContext,
        container: Container
    ) {
        this.device = device;
        this.context = context;

        this.renderPipeline = new RenderPipeline(this.device, container);
    }

    private getRenderBuckets(graph: Node): Bucket[] {
        if (graph) {
            tmpBuckets.forEach((b) => (b.meshes.length = 0));
            graph.traverse((node) => {
                node.transform.updateWorldMatrix(node.parent?.transform);
                if (node.mesh && node.material) {
                    const material = node.material;
                    if (material && material.active) {
                        let bucket = tmpBuckets.get(material.renderOrder);
                        if (!bucket) {
                            bucket = new Bucket();
                            bucket.meshes = [node];
                            tmpBuckets.set(material.renderOrder, bucket);
                        } else {
                            bucket.meshes.push(node);
                        }
                    }
                }
            });

            const result: Bucket[] = [];
            tmpBuckets.forEach((b) => {
                if (b.meshes.length > 0) {
                    result.push(b);
                    // Sort by material to reduce pipeline switches
                    b.meshes.sort((a, b) => {
                        if (a.material.id === b.material.id) {
                            return a.mesh.id - b.mesh.id;
                        }
                        return a.material.id - b.material.id;
                    });
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
    render(root: Node | null, camera: Camera) {
        if (this._destroyed) {
            throw new Error('this renderer is destroyed');
        }
        if (!camera) {
            throw new Error('no camera specified');
        }

        camera.transform.updateWorldMatrix(camera.parent?.transform);

        this.renderPipeline.setClearColor(this.clearColor);
        const buckets = this.getRenderBuckets(root);
        const command = new RenderCommand({
            camera,
            buckets,
            target: this.context.getCurrentTexture(),
        });
        this.renderPipeline.executeRenderCommand(command);

        this._frameCount++;
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
        this._destroyed = true;
        this.renderPipeline.destroy();
    }
}

export default Renderer;
