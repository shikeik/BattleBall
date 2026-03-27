/**
 * BeanManager - 彩豆管理器
 * 使用 WebGPU 实例化渲染高效渲染 80 万彩豆
 *
 * 优化策略：
 * - 所有彩豆数据一次性上传到 GPU
 * - 顶点着色器中进行视锥剔除（将被剔除的彩豆半径设为 0）
 * - 一次 draw 调用渲染所有彩豆
 */
declare class BeanManager {
    mapSize: number;
    gridCount: number;
    gridSize: number;
    beanCount: number;
    beanRadius: number;
    beans: any[];
    gridIndex: Map<any, any>;
    eatenBeans: Set<any>;
    eatenCount: number;
    device: GPUDevice | null;
    pipeline: GPURenderPipeline | null;
    bindGroup: GPUBindGroup | null;
    instanceBuffer: GPUBuffer | null;
    uniformBuffer: GPUBuffer | null;
    context: any;
    initWebGPU(): Promise<boolean>;
    _createPipeline(): Promise<void>;
    generateBeans(): void;
    _createInstanceBuffer(): void;
    initRenderResources(canvas: any): Promise<boolean>;
    canvasFormat: GPUTextureFormat | undefined;
    render(cameraX: any, cameraY: any, zoom: any, screenWidth: any, screenHeight: any): void;
    _updateViewParams(cameraX: any, cameraY: any, zoom: any, screenWidth: any, screenHeight: any): void;
    eatBeans(playerX: any, playerY: any, playerRadius: any): number;
    _updateEatenBeansInGPU(): void;
    destroy(): void;
}
