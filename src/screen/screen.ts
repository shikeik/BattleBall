/**
 * Screen 基类
 * 支持转屏（横竖屏切换）自适应
 * 
 * 设计原则：
 * - 基类统一管理 resize 和 canvas 尺寸更新
 * - 子类不需要覆盖 onResize 除非有特殊需求
 * - 参考原版 GScreen 设计
 */
class GScreen {
	screenManager: any;
	initialized: boolean = false;
	visible: boolean = false;
	uiViewport: any = null;
	worldCamera: any;
	screenWidth: number = 0;
	screenHeight: number = 0;
	dpr: number = 1;
	
	// resize 事件处理
	private _resizeHandler: (() => void) | null = null;
	
	// canvas 引用（子类可通过 getCanvas() 获取）
	protected _canvas: HTMLCanvasElement | null = null;
	


	constructor(screenManager?: any) {
		if (screenManager) {
			this.screenManager = screenManager;
		}
		this.worldCamera = {
			x: 0, y: 0, zoom: 1.0, width: 0, height: 0
		};
	}

	initialize(): void {
		if (this.initialized) return;
		this._updateScreenSize();
		this._initUIViewport();
		this._initWorldCamera();
		this._updateCanvasSize();
		this.init();
		this.initialized = true;
		if ((window as any).logger) (window as any).logger.log('SCREEN', `${this.constructor.name} initialized`);
	}
	
	/**
	 * 获取 UI 安全区域
	 * 返回考虑工具条等因素后的可用区域
	 * 
	 * 安全区域常量：
	 * - SAFE_AREA_TOP = 50 (工具条高度)
	 * - SAFE_AREA_BOTTOM = 0
	 * - SAFE_AREA_LEFT = 0
	 * - SAFE_AREA_RIGHT = 0
	 */
	getSafeArea(): { x: number; y: number; width: number; height: number } {
		const SAFE_AREA_TOP = 50;
		const SAFE_AREA_BOTTOM = 0;
		const SAFE_AREA_LEFT = 0;
		const SAFE_AREA_RIGHT = 0;
		return {
			x: SAFE_AREA_LEFT,
			y: SAFE_AREA_TOP,
			width: this.screenWidth - SAFE_AREA_LEFT - SAFE_AREA_RIGHT,
			height: this.screenHeight - SAFE_AREA_TOP - SAFE_AREA_BOTTOM
		};
	}

	_updateScreenSize(): void {
		const oldW = this.screenWidth;
		const oldH = this.screenHeight;
		
		// 使用 visualViewport 获取实际可视区域尺寸（处理浏览器差异）
		// Edge 非全屏时 window.innerHeight 和 100vh 可能不一致
		const vv = (window as any).visualViewport;
		if (vv) {
			// visualViewport 返回的是 CSS 像素，需要考虑缩放
			this.screenWidth = vv.width;
			this.screenHeight = vv.height;
		} else {
			this.screenWidth = window.innerWidth;
			this.screenHeight = window.innerHeight;
		}
		
		this.dpr = window.devicePixelRatio || 1;
		
		if ((window as any).logger && (oldW !== this.screenWidth || oldH !== this.screenHeight)) {
			(window as any).logger.log('RESIZE_DBG', `Size: ${oldW}x${oldH} -> ${this.screenWidth}x${this.screenHeight}`);
		}
	}

	/**
	 * 获取 canvas 元素
	 * 子类可以覆盖此方法返回特定的 canvas
	 */
	getCanvas(): HTMLCanvasElement | null {
		if (!this._canvas) {
			this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		}
		return this._canvas;
	}

	/**
	 * 更新 canvas 尺寸
	 * 基类统一管理，子类不需要处理
	 * 
	 * 注意：CSS 已设置 canvas 为 100vw/100vh，此处只更新实际像素尺寸
	 */
	protected _updateCanvasSize(): void {
		const canvas = this.getCanvas();
		if (!canvas) return;
		
		// 获取 canvas 实际渲染尺寸（CSS 像素）
		const rect = canvas.getBoundingClientRect();
		const cssWidth = rect.width;
		const cssHeight = rect.height;
		
		// 根据实际渲染尺寸计算内部像素尺寸
		const newWidth = Math.floor(cssWidth * this.dpr);
		const newHeight = Math.floor(cssHeight * this.dpr);
		
		// 只在尺寸变化时才更新
		if (canvas.width !== newWidth || canvas.height !== newHeight) {
			canvas.width = newWidth;
			canvas.height = newHeight;
			
			if ((window as any).logger) {
				(window as any).logger.log('SCREEN', `Canvas resized: ${newWidth}x${newHeight} (CSS: ${cssWidth.toFixed(1)}x${cssHeight.toFixed(1)})`);
			}
		}
	}

	/**
	 * 初始化 UI 视口
	 * 根据横竖屏选择不同的逻辑分辨率
	 */
	_initUIViewport(): void {
		const isLandscape = this.screenWidth > this.screenHeight;
		const worldWidth = isLandscape ? 960 : 540;
		const worldHeight = isLandscape ? 540 : 960;
		
		if (typeof (window as any).Viewport !== 'undefined') {
			this.uiViewport = new (window as any).Viewport(worldWidth, worldHeight);
			this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
		}
	}

	/**
	 * 更新 UI 视口方向
	 * 横竖屏切换时调用，动态调整 world 尺寸
	 */
	_updateViewportOrientation(): void {
		if (!this.uiViewport) return;
		
		const isLandscape = this.screenWidth > this.screenHeight;
		const wasLandscape = this.uiViewport.worldWidth > this.uiViewport.worldHeight;
		
		if (isLandscape !== wasLandscape) {
			// 方向改变，更新 Viewport 的 world 尺寸
			this.uiViewport.updateOrientation(isLandscape);
			
			if ((window as any).logger) {
				(window as any).logger.log('SCREEN', `Viewport orientation updated: ${isLandscape ? 'landscape' : 'portrait'}`);
			}
		}
	}

	_initWorldCamera(): void {
		this.worldCamera = { 
			x: 0, y: 0, zoom: 1.0, 
			width: this.screenWidth, 
			height: this.screenHeight 
		};
	}

	init(): void {}
	
	enter(): void {
		this.visible = true;
		this._updateScreenSize();
		
		// 更新 Viewport 方向（如果需要）
		this._updateViewportOrientation();
		
		// 更新 Viewport（但不重复更新 canvas，因为 initialize 已经做了）
		if (this.uiViewport) {
			this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
		}
		
		// 注意：不再调用 _updateCanvasSize()，因为 initialize() 已经调用过了
		// 如果需要强制刷新，可以调用 resize() 方法
		
		// 绑定 resize 事件监听
		// 注意：orientationchange 会触发 resize，不需要单独监听
		this._resizeHandler = () => this._onResize();
		window.addEventListener('resize', this._resizeHandler);
		
		if ((window as any).logger) (window as any).logger.log('SCREEN', `${this.constructor.name} enter`);
	}
	
	exit(): void {
		this.visible = false;
		
		// 移除 resize 事件监听
		if (this._resizeHandler) {
			window.removeEventListener('resize', this._resizeHandler);
			this._resizeHandler = null;
		}
		
		// 清除防抖定时器
		if (this._resizeTimeout) {
			clearTimeout(this._resizeTimeout);
			this._resizeTimeout = null;
		}
		
		if ((window as any).logger) (window as any).logger.log('SCREEN', `${this.constructor.name} exit`);
	}
	
	render(delta: number): void {}
	
	/**
	 * resize 回调（子类可覆盖）
	 * 基类已经处理了 Viewport 和 canvas 尺寸更新
	 * 子类只需要处理自己的特殊逻辑
	 */
	onResize(): void {
		// 子类可覆盖此方法处理额外的转屏逻辑
	}
	
	// resize 防抖定时器
	private _resizeTimeout: number | null = null;
	
	/**
	 * 内部 resize 处理
	 * 统一处理 Viewport、canvas、世界相机的更新
	 */
	private _onResize(): void {
		// 防抖：清除之前的定时器
		if (this._resizeTimeout) {
			clearTimeout(this._resizeTimeout);
		}
		
		// 延迟执行，等待屏幕尺寸稳定（ orientationchange 需要更长时间）
		this._resizeTimeout = window.setTimeout(() => {
			this._resizeTimeout = null;
			
			this._updateScreenSize();
			
			// 更新 Viewport 方向（如果需要）
			this._updateViewportOrientation();
			
			// 更新 Viewport
			if (this.uiViewport) {
				this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
			}
			
			// 更新 canvas 尺寸（基类统一管理）
			this._updateCanvasSize();
			
			// 更新世界相机
			this.worldCamera.width = this.screenWidth;
			this.worldCamera.height = this.screenHeight;
			
			// 调用子类的 onResize
			this.onResize();
			
			const isLandscape = this.screenWidth > this.screenHeight;
			if ((window as any).logger) {
				(window as any).logger.log('SCREEN', `Resized to ${this.screenWidth}x${this.screenHeight} (${isLandscape ? 'landscape' : 'portrait'})`);
			}
		}, 100);
	}
	
	/**
	 * 强制 resize（供外部调用，如工具条全屏切换）
	 * 参考原版 GScreen.resize()
	 */
	resize(): void {
		this._updateScreenSize();
		
		// 更新 Viewport 方向（如果需要）
		this._updateViewportOrientation();
		
		// 更新 Viewport
		if (this.uiViewport) {
			this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
		}
		
		// 更新 canvas 尺寸
		this._updateCanvasSize();
		
		// 更新世界相机
		this.worldCamera.width = this.screenWidth;
		this.worldCamera.height = this.screenHeight;
		
		// 调用子类的 onResize
		this.onResize();
	}
	
	handleBack(): boolean { return false; }
	
	destroy(): void {
		this.initialized = false;
		if ((window as any).logger) (window as any).logger.log('SCREEN', `${this.constructor.name} destroyed`);
	}
}

if (typeof window !== 'undefined') {
	(window as any).Screen = GScreen;
}
