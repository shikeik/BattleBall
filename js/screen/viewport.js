/**
 * Viewport - 视口系统
 * 处理逻辑分辨率与物理分辨率的映射，解决模糊问题
 * 
 * 设计原则：
 * - 游戏使用固定逻辑分辨率（如 540x960）
 * - 自动适配不同屏幕尺寸和 DPR
 * - 支持横竖屏切换
 */
class Viewport {
	constructor(worldWidth, worldHeight) {
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;
		this.screenWidth = 0;
		this.screenHeight = 0;
		this.dpr = 1;
		
		// 计算出的缩放和偏移
		this.scale = 1;
		this.offsetX = 0;
		this.offsetY = 0;
	}
	
	/**
	 * 更新视口尺寸
	 * @param {number} screenWidth - 屏幕 CSS 像素宽度
	 * @param {number} screenHeight - 屏幕 CSS 像素高度
	 * @param {number} dpr - 设备像素比
	 */
	update(screenWidth, screenHeight, dpr = 1) {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.dpr = dpr;
		
		// 计算缩放比例，保持宽高比，短边优先（类似 ExtendViewport）
		const scaleX = screenWidth / this.worldWidth;
		const scaleY = screenHeight / this.worldHeight;
		this.scale = Math.min(scaleX, scaleY);
		
		// 计算居中偏移
		this.offsetX = (screenWidth - this.worldWidth * this.scale) / 2;
		this.offsetY = (screenHeight - this.worldHeight * this.scale) / 2;
	}
	
	/**
	 * 将屏幕坐标转换为世界坐标
	 */
	toWorld(screenX, screenY) {
		return {
			x: (screenX - this.offsetX) / this.scale,
			y: (screenY - this.offsetY) / this.scale
		};
	}
	
	/**
	 * 将世界坐标转换为屏幕坐标
	 */
	toScreen(worldX, worldY) {
		return {
			x: worldX * this.scale + this.offsetX,
			y: worldY * this.scale + this.offsetY
		};
	}
	
	/**
	 * 获取实际的 Canvas 像素尺寸（考虑 DPR）
	 */
	getCanvasSize() {
		return {
			width: Math.floor(this.screenWidth * this.dpr),
			height: Math.floor(this.screenHeight * this.dpr)
		};
	}
	
	/**
	 * 应用视口变换到 Canvas 上下文
	 */
	apply(ctx) {
		const size = this.getCanvasSize();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(this.dpr, this.dpr);
	}
	
	/**
	 * 开始世界坐标系渲染
	 */
	beginWorldRender(ctx) {
		ctx.save();
		ctx.translate(this.offsetX, this.offsetY);
		ctx.scale(this.scale, this.scale);
	}
	
	/**
	 * 结束世界坐标系渲染
	 */
	endWorldRender(ctx) {
		ctx.restore();
	}
}

/**
 * 自动根据方向创建视口
 * @param {number} shortSide - 短边逻辑尺寸（如 540）
 * @param {number} longSide - 长边逻辑尺寸（如 960）
 * @param {boolean} isLandscape - 是否横屏
 */
function createViewport(shortSide = 540, longSide = 960, isLandscape = false) {
	const w = isLandscape ? longSide : shortSide;
	const h = isLandscape ? shortSide : longSide;
	return new Viewport(w, h);
}

window.Viewport = Viewport;
window.createViewport = createViewport;
