"use strict";
/**
 * Viewport - 视口系统
 *
 * 支持动态调整 world 尺寸，用于横竖屏切换
 * 参考原版 LibGDX ExtendViewport 设计
 */
class Viewport {
    constructor(worldWidth, worldHeight) {
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.dpr = 1;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
    }
    /**
     * 动态设置 world 尺寸
     * 用于横竖屏切换时调整逻辑分辨率
     */
    setWorldSize(worldWidth, worldHeight) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        // 重新计算缩放和偏移
        this._recalculate();
    }
    /**
     * 根据当前方向自动调整 world 尺寸
     * 短边固定为 540，长边固定为 960
     */
    updateOrientation(isLandscape) {
        const shortSide = 540;
        const longSide = 960;
        if (isLandscape) {
            this.setWorldSize(longSide, shortSide);
        }
        else {
            this.setWorldSize(shortSide, longSide);
        }
    }
    update(screenWidth, screenHeight, dpr = 1) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.dpr = dpr;
        this._recalculate();
    }
    /**
     * 重新计算缩放和偏移
     */
    _recalculate() {
        const scaleX = this.screenWidth / this.worldWidth;
        const scaleY = this.screenHeight / this.worldHeight;
        this.scale = Math.min(scaleX, scaleY);
        this.offsetX = (this.screenWidth - this.worldWidth * this.scale) / 2;
        this.offsetY = (this.screenHeight - this.worldHeight * this.scale) / 2;
    }
    toWorld(screenX, screenY) {
        return {
            x: (screenX - this.offsetX) / this.scale,
            y: (screenY - this.offsetY) / this.scale
        };
    }
    toScreen(worldX, worldY) {
        return {
            x: worldX * this.scale + this.offsetX,
            y: worldY * this.scale + this.offsetY
        };
    }
    getCanvasSize() {
        return {
            width: Math.floor(this.screenWidth * this.dpr),
            height: Math.floor(this.screenHeight * this.dpr)
        };
    }
    apply(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(this.dpr, this.dpr);
    }
    beginWorldRender(ctx) {
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.scale, this.scale);
    }
    endWorldRender(ctx) {
        ctx.restore();
    }
}
function createViewport(shortSide = 540, longSide = 960, isLandscape = false) {
    const w = isLandscape ? longSide : shortSide;
    const h = isLandscape ? shortSide : longSide;
    return new Viewport(w, h);
}
// 导出到全局（兼容现有代码）
if (typeof window !== 'undefined') {
    window.Viewport = Viewport;
    window.createViewport = createViewport;
}
//# sourceMappingURL=viewport.js.map