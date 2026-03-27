/**
 * BeanManager - 彩豆管理器
 *
 * 数据结构（每实例20字节）：
 * - position: vec2<f32> (8 bytes)
 * - colorIndex: u32 (4 bytes)
 * - sides: u32 (4 bytes)
 * - rotation: u32 (4 bytes) - 0-360度
 *
 * 80万实例 = 16MB
 */
declare class BeanManager {
    mapSize: number;
    gridCount: number;
    gridSize: number;
    beanCount: number;
    beanRadius: number;
    colorPalette: number[];
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
    dirtyBeans: any[];
    maxDirtyPerFrame: number;
    _generateColorPalette(): number[];
    initWebGPU(): Promise<boolean>;
    _createPipeline(): Promise<void>;
    generateBeans(): void;
    _createInstanceBuffer(): void;
    _createColorPaletteBuffer(): void;
    colorPaletteBuffer: GPUBuffer | undefined;
    initRenderResources(canvas: any): Promise<boolean>;
    render(cameraX: any, cameraY: any, zoom: any, screenWidth: any, screenHeight: any): void;
    _updateViewParams(cameraX: any, cameraY: any, zoom: any, screenWidth: any, screenHeight: any): void;
    _getVisibleBeanCount(cameraX: any, cameraY: any, viewW: any, viewH: any): number;
    _processDirtyBeans(): void;
    eatBeans(playerX: any, playerY: any, playerRadius: any): number;
    destroy(): void;
}
