/**
 * Screen 基类
 * 每个屏幕有独立的 UI Viewport 和 World Camera
 * 
 * 参考原版 SandTank GScreen 设计：
 * - uiViewport: UI 视口，固定逻辑分辨率
 * - worldCamera: 世界相机，用于游戏渲染
 */
class Screen {
	constructor(screenManager) {
		this.screenManager = screenManager;
		this.initialized = false;
		this.visible = false;
		
		// UI 视口（固定 540x960 逻辑分辨率）
		this.uiViewport = null;
		
		// 世界相机（用于游戏世界渲染）
		this.worldCamera = {
			x: 0,
			y: 0,
			zoom: 1.0,
			width: 0,
			height: 0
		};
		
		// 屏幕尺寸（物理像素）
		this.screenWidth = 0;
		this.screenHeight = 0;
		this.dpr = 1;
	}

	/**
	 * 初始化（幂等）
	 */
	initialize() {
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
		if (window.logger) logger.log('SCREEN', `${this.constructor.name} initialized`);
	}
	
	/**
	 * 更新屏幕尺寸
	 */
	_updateScreenSize() {
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;
		this.dpr = window.devicePixelRatio || 1;
	}
	
	/**
	 * 初始化 UI 视口
	 * 固定 540x960 逻辑分辨率，自动适配屏幕
	 */
	_initUIViewport() {
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
	_initWorldCamera() {
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
	init() {
		// 子类实现
	}

	/**
	 * 进入屏幕
	 */
	enter() {
		this.visible = true;
		this._updateScreenSize();
		if (this.uiViewport) {
			this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
		}
		if (window.logger) logger.log('SCREEN', `${this.constructor.name} enter`);
	}

	/**
	 * 离开屏幕
	 */
	exit() {
		this.visible = false;
		if (window.logger) logger.log('SCREEN', `${this.constructor.name} exit`);
	}

	/**
	 * 渲染（子类实现）
	 * @param {number} delta - 时间间隔（秒）
	 */
	render(delta) {
		// 子类实现
	}
	
	/**
	 * 窗口大小变化时调用
	 */
	resize() {
		this._updateScreenSize();
		if (this.uiViewport) {
			this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
		}
		this.worldCamera.width = this.screenWidth;
		this.worldCamera.height = this.screenHeight;
	}

	/**
	 * 处理返回键
	 * @returns {boolean} 是否已处理
	 */
	handleBack() {
		return false;
	}

	/**
	 * 销毁屏幕
	 */
	destroy() {
		this.initialized = false;
		if (window.logger) logger.log('SCREEN', `${this.constructor.name} destroyed`);
	}
}

window.Screen = Screen;
