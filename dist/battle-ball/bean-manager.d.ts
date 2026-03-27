/**
 * BeanManager - 彩豆管理器
 * 80万彩豆的生成、存储和渲染
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
    context: any;
    initWebGPU(): Promise<boolean>;
    generateBeans(): void;
    initRenderResources(canvas: any): Promise<boolean>;
    render(cameraX: any, cameraY: any, zoom: any, screenWidth: any, screenHeight: any): void;
    eatBeans(playerX: any, playerY: any, playerRadius: any): number;
    destroy(): void;
}
