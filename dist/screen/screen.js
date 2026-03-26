"use strict";
/**
 * Screen 基类
 */
class GScreen {
    constructor(screenManager) {
        this.initialized = false;
        this.visible = false;
        this.uiViewport = null;
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.dpr = 1;
        if (screenManager) {
            this.screenManager = screenManager;
        }
        this.worldCamera = {
            x: 0, y: 0, zoom: 1.0, width: 0, height: 0
        };
    }
    initialize() {
        if (this.initialized)
            return;
        this._updateScreenSize();
        this._initUIViewport();
        this._initWorldCamera();
        this.init();
        this.initialized = true;
        if (window.logger)
            window.logger.log('SCREEN', `${this.constructor.name} initialized`);
    }
    _updateScreenSize() {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.dpr = window.devicePixelRatio || 1;
    }
    _initUIViewport() {
        const isLandscape = this.screenWidth > this.screenHeight;
        const worldWidth = isLandscape ? 960 : 540;
        const worldHeight = isLandscape ? 540 : 960;
        if (typeof window.Viewport !== 'undefined') {
            this.uiViewport = new window.Viewport(worldWidth, worldHeight);
            this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
        }
    }
    _initWorldCamera() {
        this.worldCamera = { x: 0, y: 0, zoom: 1.0, width: this.screenWidth, height: this.screenHeight };
    }
    init() { }
    enter() {
        this.visible = true;
        this._updateScreenSize();
        if (this.uiViewport)
            this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
        if (window.logger)
            window.logger.log('SCREEN', `${this.constructor.name} enter`);
    }
    exit() {
        this.visible = false;
        if (window.logger)
            window.logger.log('SCREEN', `${this.constructor.name} exit`);
    }
    render(delta) { }
    resize() {
        this._updateScreenSize();
        if (this.uiViewport)
            this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
        this.worldCamera.width = this.screenWidth;
        this.worldCamera.height = this.screenHeight;
    }
    handleBack() { return false; }
    destroy() {
        this.initialized = false;
        if (window.logger)
            window.logger.log('SCREEN', `${this.constructor.name} destroyed`);
    }
}
if (typeof window !== 'undefined') {
    window.Screen = GScreen;
}
//# sourceMappingURL=screen.js.map