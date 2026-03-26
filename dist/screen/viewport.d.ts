/**
 * Viewport - 视口系统
 *
 * 支持动态调整 world 尺寸，用于横竖屏切换
 * 参考原版 LibGDX ExtendViewport 设计
 */
declare class Viewport {
    worldWidth: number;
    worldHeight: number;
    screenWidth: number;
    screenHeight: number;
    dpr: number;
    scale: number;
    offsetX: number;
    offsetY: number;
    constructor(worldWidth: number, worldHeight: number);
    /**
     * 动态设置 world 尺寸
     * 用于横竖屏切换时调整逻辑分辨率
     */
    setWorldSize(worldWidth: number, worldHeight: number): void;
    /**
     * 根据当前方向自动调整 world 尺寸
     * 短边固定为 540，长边固定为 960
     */
    updateOrientation(isLandscape: boolean): void;
    update(screenWidth: number, screenHeight: number, dpr?: number): void;
    /**
     * 重新计算缩放和偏移
     */
    private _recalculate;
    toWorld(screenX: number, screenY: number): {
        x: number;
        y: number;
    };
    toScreen(worldX: number, worldY: number): {
        x: number;
        y: number;
    };
    getCanvasSize(): {
        width: number;
        height: number;
    };
    apply(ctx: CanvasRenderingContext2D): void;
    beginWorldRender(ctx: CanvasRenderingContext2D): void;
    endWorldRender(ctx: CanvasRenderingContext2D): void;
}
declare function createViewport(shortSide?: number, longSide?: number, isLandscape?: boolean): Viewport;
