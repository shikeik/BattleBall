/**
 * Screen 基类
 * 每个屏幕有独立的 UI Viewport 和 World Camera
 * 
 * 参考原版 SandTank GScreen 设计：
 * - uiViewport: UI 视口，固定逻辑分辨率
 * - worldCamera: 世界相机，用于游戏渲染
 */

interface WorldCamera {
	x: number;
	y: number;
	zoom: number;
	width: number;
	height: number;
}

class Screen {
	screenManager: ScreenManager;
	initialized: boolean = false;
	visible: boolean = false;
	
	// UI 视口（固定 540x960 逻辑分辨率）
	uiViewport: Viewport | null = null;
	
	// 世界相机（用于游戏世界渲染）
	worldCamera: WorldCamera;
	
	// 屏幕尺寸（物理像素）
	screenWidth: number = 0;
	screenHeight: number = 0;
	dpr: number = 1;

	constructor(screenManager: ScreenManager) {
		this.screenManager = screenManager;
		
		// 初始化世界相机
		this.worldCamera = {
			x: 0,
			y: 0,
			zoom: 1.0,
			width: 0,
			height: 0
		};
	}

	/**
	 * 初始化（幂等）
	 */
	initialize(): void {
		if (this.initialized) return;
		
		// 初始化屏幕尺寸
		this._updateScreenSize();
		
		// 初始化 UI 视口
		this._initUIViewport();
		
		// 初始化世界相机
		this._initWorldCamera();
		
		// 子类初始化
		this.init();
		
		this.initialized = true;
		if (window.logger) window.logger.log('SCREEN', `${this.constructor.name} initialized`);
	}
	
	/**
	 * 更新屏幕尺寸
	 */
	_updateScreenSize(): void {
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;
		this.dpr = window.devicePixelRatio || 1;
	}
	
	/**
	 * 初始化 UI 视口
	 * 固定 540x960 逻辑分辨率，自动适配屏幕
	 */
	_initUIViewport(): void {
		// 竖屏：短边 540，长边 960
		const isLandscape = this.screenWidth > this.screenHeight;
		const worldWidth = isLandscape ? 960 : 540;
		const worldHeight = isLandscape ? 540 : 960;
		
		this.uiViewport = new Viewport(worldWidth, worldHeight);
		this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
	}
	
	/**
	 * 初始化世界相机
	 * 子类可覆盖
	 */
	_initWorldCamera(): void {
		this.worldCamera = {
			x: 0,
			y: 0,
			zoom: 1.0,
			width: this.screenWidth,
			height: this.screenHeight
		};
	}

	/**
	 * 子类覆盖：初始化资源
	 */
	init(): void {
		// 子类实现
	}

	/**
	 * 进入屏幕
	 */
	enter(): void {
		this.visible = true;
		this._updateScreenSize();
		if (this.uiViewport) {
			this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
		}
		if (window.logger) window.logger.log('SCREEN', `${this.constructor.name} enter`);
	}

	/**
	 * 离开屏幕
	 */
	exit(): void {
		this.visible = false;
		if (window.logger) window.logger.log('SCREEN', `${this.constructor.name} exit`);
	}

	/**
	 * 渲染（子类实现）
	 * @param delta - 时间间隔（秒）
	 */
	render(delta: number): void {
		// 子类实现
	}
	
	/**
	 * 窗口大小变化时调用
	 */
	resize(): void {
		this._updateScreenSize();
		if (this.uiViewport) {
			this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
		}
		this.worldCamera.width = this.screenWidth;
		this.worldCamera.height = this.screenHeight;
	}

	/**
	 * 处理返回键
	 * @returns 是否已处理
	 */
	handleBack(): boolean {
		return false;
	}

	/**
	 * 销毁屏幕
	 */
	destroy(): void {
		this.initialized = false;
		if (window.logger) window.logger.log('SCREEN', `${this.constructor.name} destroyed`);
	}
}

(window as any).Screen = Screen;
