/**
 * WebGPU Compute Shader Particle System Demo
 * Based on: https://github.com/andrinr/webgpu-particles
 * A minimal example of particle system using WebGPU compute shaders
 */
declare const WORKGROUP_SIZE: 8;
declare const GRID_SIZE: 512;
declare const UPDATE_INTERVAL: 30;
declare class WebGPUDemo {
    constructor(canvas: any);
    canvas: any;
    step: number;
    device: GPUDevice | null;
    canvasContext: any;
    canvasFormat: GPUTextureFormat | null;
    animationId: number | null;
    initialized: boolean;
    init(): Promise<boolean>;
    setupBuffers(): Promise<void>;
    uniformSize: Float32Array<ArrayBuffer> | undefined;
    uniformDt: Float32Array<ArrayBuffer> | undefined;
    vertices: Float32Array<ArrayBuffer> | undefined;
    particleStateArray: Float32Array<ArrayBuffer> | undefined;
    sizeBuffer: GPUBuffer | undefined;
    dtBuffer: GPUBuffer | undefined;
    vertexBuffer: GPUBuffer | undefined;
    particleStateBuffers: GPUBuffer[] | undefined;
    loadShader(path: any, label: any): Promise<GPUShaderModule>;
    setupShaders(): Promise<void>;
    vertexShaderModule: GPUShaderModule | undefined;
    fragmentShaderModule: GPUShaderModule | undefined;
    computeShaderModule: GPUShaderModule | undefined;
    vertexBufferLayout: {
        arrayStride: number;
        attributes: {
            format: string;
            offset: number;
            shaderLocation: number;
        }[];
        stepMode: string;
    } | undefined;
    setupPipelines(): Promise<void>;
    bindGroupLayout: GPUBindGroupLayout | undefined;
    bindGroups: GPUBindGroup[] | undefined;
    pipelineLayout: GPUPipelineLayout | undefined;
    renderPipeline: GPURenderPipeline | undefined;
    computePipeline: GPUComputePipeline | undefined;
    update(): void;
    start(): void;
    stop(): void;
    destroy(): void;
}
