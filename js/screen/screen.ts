/**
 * Screen 基类
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
		this.init();
		this.initialized = true;
		if ((window as any).logger) (window as any).logger.log('SCREEN', `${this.constructor.name} initialized`);
	}

	_updateScreenSize(): void {
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;
		this.dpr = window.devicePixelRatio || 1;
	}

	_initUIViewport(): void {
		const isLandscape = this.screenWidth > this.screenHeight;
		const worldWidth = isLandscape ? 960 : 540;
		const worldHeight = isLandscape ? 540 : 960;
		if (typeof (window as any).Viewport !== 'undefined') {
			this.uiViewport = new (window as any).Viewport(worldWidth, worldHeight);
			this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
		}
	}

	_initWorldCamera(): void {
		this.worldCamera = { x: 0, y: 0, zoom: 1.0, width: this.screenWidth, height: this.screenHeight };
	}

	init(): void {}
	enter(): void {
		this.visible = true;
		this._updateScreenSize();
		if (this.uiViewport) this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
		if ((window as any).logger) (window as any).logger.log('SCREEN', `${this.constructor.name} enter`);
	}
	exit(): void {
		this.visible = false;
		if ((window as any).logger) (window as any).logger.log('SCREEN', `${this.constructor.name} exit`);
	}
	render(delta: number): void {}
	resize(): void {
		this._updateScreenSize();
		if (this.uiViewport) this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
		this.worldCamera.width = this.screenWidth;
		this.worldCamera.height = this.screenHeight;
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
