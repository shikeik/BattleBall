"use strict";
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
    constructor(screenManager) {
        this.initialized = false;
        this.visible = false;
        this.uiViewport = null;
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.dpr = 1;
        // resize 事件处理
        this._resizeHandler = null;
        // canvas 引用（子类可通过 getCanvas() 获取）
        this._canvas = null;
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
        this._updateCanvasSize();
        this.init();
        this.initialized = true;
        if (window.logger)
            window.logger.log('SCREEN', `${this.constructor.name} initialized`);
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
    getSafeArea() {
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
    _updateScreenSize() {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.dpr = window.devicePixelRatio || 1;
    }
    /**
     * 获取 canvas 元素
     * 子类可以覆盖此方法返回特定的 canvas
     */
    getCanvas() {
        if (!this._canvas) {
            this._canvas = document.getElementById('gameCanvas');
        }
        return this._canvas;
    }
    /**
     * 更新 canvas 尺寸
     * 基类统一管理，子类不需要处理
     */
    _updateCanvasSize() {
        const canvas = this.getCanvas();
        if (!canvas)
            return;
        // 设置 canvas 的 CSS 尺寸（逻辑像素）
        canvas.style.width = this.screenWidth + 'px';
        canvas.style.height = this.screenHeight + 'px';
        // 设置 canvas 的实际尺寸（物理像素，考虑 DPR）
        canvas.width = Math.floor(this.screenWidth * this.dpr);
        canvas.height = Math.floor(this.screenHeight * this.dpr);
        if (window.logger) {
            window.logger.log('SCREEN', `Canvas resized: ${canvas.width}x${canvas.height} (DPR: ${this.dpr})`);
        }
    }
    /**
     * 初始化 UI 视口
     * 根据横竖屏选择不同的逻辑分辨率
     */
    _initUIViewport() {
        const isLandscape = this.screenWidth > this.screenHeight;
        const worldWidth = isLandscape ? 960 : 540;
        const worldHeight = isLandscape ? 540 : 960;
        if (typeof window.Viewport !== 'undefined') {
            this.uiViewport = new window.Viewport(worldWidth, worldHeight);
            this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
        }
    }
    /**
     * 更新 UI 视口方向
     * 横竖屏切换时调用，动态调整 world 尺寸
     */
    _updateViewportOrientation() {
        if (!this.uiViewport)
            return;
        const isLandscape = this.screenWidth > this.screenHeight;
        const wasLandscape = this.uiViewport.worldWidth > this.uiViewport.worldHeight;
        if (isLandscape !== wasLandscape) {
            // 方向改变，更新 Viewport 的 world 尺寸
            this.uiViewport.updateOrientation(isLandscape);
            if (window.logger) {
                window.logger.log('SCREEN', `Viewport orientation updated: ${isLandscape ? 'landscape' : 'portrait'}`);
            }
        }
    }
    _initWorldCamera() {
        this.worldCamera = {
            x: 0, y: 0, zoom: 1.0,
            width: this.screenWidth,
            height: this.screenHeight
        };
    }
    init() { }
    enter() {
        this.visible = true;
        this._updateScreenSize();
        // 更新 Viewport 方向（如果需要）
        this._updateViewportOrientation();
        // 更新 Viewport 和 canvas 尺寸
        if (this.uiViewport) {
            this.uiViewport.update(this.screenWidth, this.screenHeight, this.dpr);
        }
        this._updateCanvasSize();
        // 绑定 resize 事件监听
        this._resizeHandler = () => this._onResize();
        window.addEventListener('resize', this._resizeHandler);
        window.addEventListener('orientationchange', this._resizeHandler);
        if (window.logger)
            window.logger.log('SCREEN', `${this.constructor.name} enter`);
    }
    exit() {
        this.visible = false;
        // 移除 resize 事件监听
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            window.removeEventListener('orientationchange', this._resizeHandler);
            this._resizeHandler = null;
        }
        if (window.logger)
            window.logger.log('SCREEN', `${this.constructor.name} exit`);
    }
    render(delta) { }
    /**
     * resize 回调（子类可覆盖）
     * 基类已经处理了 Viewport 和 canvas 尺寸更新
     * 子类只需要处理自己的特殊逻辑
     */
    onResize() {
        // 子类可覆盖此方法处理额外的转屏逻辑
    }
    /**
     * 内部 resize 处理
     * 统一处理 Viewport、canvas、世界相机的更新
     */
    _onResize() {
        // 延迟执行，等待屏幕尺寸稳定
        setTimeout(() => {
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
            if (window.logger) {
                window.logger.log('SCREEN', `Resized to ${this.screenWidth}x${this.screenHeight} (${isLandscape ? 'landscape' : 'portrait'})`);
            }
        }, 100);
    }
    /**
     * 强制 resize（供外部调用，如工具条全屏切换）
     * 参考原版 GScreen.resize()
     */
    resize() {
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