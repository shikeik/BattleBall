/**
 * BeanManager - 彩豆管理器
 * 简化版：直接渲染前2万个彩豆
 */
declare class BeanManager {
    mapSize: number;
    beanCount: number;
    beanRadius: number;
    colorPalette: number[];
    beans: any[];
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
    _createColorPaletteBuffer(): void;
    colorPaletteBuffer: GPUBuffer | undefined;
    initRenderResources(canvas: any): Promise<boolean>;
    render(cameraX: any, cameraY: any, zoom: any, screenWidth: any, screenHeight: any): void;
    eatBeans(playerX: any, playerY: any, playerRadius: any): number;
    destroy(): void;
}
