// @ts-nocheck
/**
 * Viewport - 视口系统
 * 
 * 支持动态调整 world 尺寸，用于横竖屏切换
 * 参考原版 LibGDX ExtendViewport 设计
 */
class Viewport {
	worldWidth: number;
	worldHeight: number;
	screenWidth: number = 0;
	screenHeight: number = 0;
	dpr: number = 1;
	scale: number = 1;
	offsetX: number = 0;
	offsetY: number = 0;

	constructor(worldWidth: number, worldHeight: number) {
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;
	}

	/**
	 * 动态设置 world 尺寸
	 * 用于横竖屏切换时调整逻辑分辨率
	 */
	setWorldSize(worldWidth: number, worldHeight: number): void {
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;
		// 重新计算缩放和偏移
		this._recalculate();
	}

	/**
	 * 根据当前方向自动调整 world 尺寸
	 * 短边固定为 540，长边固定为 960
	 */
	updateOrientation(isLandscape: boolean): void {
		const shortSide = 540;
		const longSide = 960;
		if (isLandscape) {
			this.setWorldSize(longSide, shortSide);
		} else {
			this.setWorldSize(shortSide, longSide);
		}
	}

	update(screenWidth: number, screenHeight: number, dpr: number = 1): void {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.dpr = dpr;
		this._recalculate();
	}

	/**
	 * 重新计算缩放和偏移
	 */
	private _recalculate(): void {
		const scaleX = this.screenWidth / this.worldWidth;
		const scaleY = this.screenHeight / this.worldHeight;
		this.scale = Math.min(scaleX, scaleY);

		this.offsetX = (this.screenWidth - this.worldWidth * this.scale) / 2;
		this.offsetY = (this.screenHeight - this.worldHeight * this.scale) / 2;
	}

	toWorld(screenX: number, screenY: number): { x: number; y: number } {
		return {
			x: (screenX - this.offsetX) / this.scale,
			y: (screenY - this.offsetY) / this.scale
		};
	}

	toScreen(worldX: number, worldY: number): { x: number; y: number } {
		return {
			x: worldX * this.scale + this.offsetX,
			y: worldY * this.scale + this.offsetY
		};
	}

	getCanvasSize(): { width: number; height: number } {
		return {
			width: Math.floor(this.screenWidth * this.dpr),
			height: Math.floor(this.screenHeight * this.dpr)
		};
	}

	apply(ctx: CanvasRenderingContext2D): void {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(this.dpr, this.dpr);
	}

	beginWorldRender(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		ctx.translate(this.offsetX, this.offsetY);
		ctx.scale(this.scale, this.scale);
	}

	endWorldRender(ctx: CanvasRenderingContext2D): void {
		ctx.restore();
	}
}

function createViewport(shortSide: number = 540, longSide: number = 960, isLandscape: boolean = false): Viewport {
	const w = isLandscape ? longSide : shortSide;
	const h = isLandscape ? shortSide : longSide;
	return new Viewport(w, h);
}

// 导出到全局（兼容现有代码）
if (typeof window !== 'undefined') {
	(window as any).Viewport = Viewport;
	(window as any).createViewport = createViewport;
}
