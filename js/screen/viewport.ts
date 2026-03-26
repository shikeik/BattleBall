/**
 * Viewport - 视口系统
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

	update(screenWidth: number, screenHeight: number, dpr: number = 1): void {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.dpr = dpr;

		const scaleX = screenWidth / this.worldWidth;
		const scaleY = screenHeight / this.worldHeight;
		this.scale = Math.min(scaleX, scaleY);

		this.offsetX = (screenWidth - this.worldWidth * this.scale) / 2;
		this.offsetY = (screenHeight - this.worldHeight * this.scale) / 2;
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
