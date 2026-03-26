/**
 * Viewport - 视口系统
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
    update(screenWidth: number, screenHeight: number, dpr?: number): void;
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
