"use strict";
/**
 * MenuScreen - 主菜单界面
 * 原版用法：填充 screenMapping，null 作为分隔线
 */
class MenuScreen extends SelectionScreen {
    initScreenMapping(map) {
        if (window.logger)
            logger.log('TMP', 'initScreenMapping:', { GameScreen, WebGPUScreen, SettingsScreen, BattleBallScreen });
        map.set('球球大作战', BattleBallScreen);
        map.set('开始游戏', GameScreen);
        map.set('WebGPU 演示', WebGPUScreen);
        map.set('其他', null); // 分隔线
        map.set('设置', SettingsScreen);
    }
}
// 占位符游戏界面，后续实现
class GameScreen extends Screen {
    init() {
        this.canvas = document.getElementById('gameCanvas');
        if (window.logger)
            logger.log('GAME', 'GameScreen init');
    }
    enter() {
        super.enter();
        this._bindEvents();
        if (window.logger)
            logger.log('GAME', 'GameScreen enter, events bound');
    }
    exit() {
        super.exit();
        this._unbindEvents();
        if (window.logger)
            logger.log('GAME', 'GameScreen exit, events unbound');
    }
    render(delta) {
        if (!this.visible)
            return;
        if (!this.canvas)
            return;
        const ctx = this.canvas.getContext('2d');
        if (!ctx)
            return;
        // 清空画布
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.scale(this.dpr, this.dpr);
        // 使用自己的 UI Viewport
        if (!this.uiViewport)
            return;
        this.uiViewport.apply(ctx);
        this.uiViewport.beginWorldRender(ctx);
        const w = this.uiViewport.worldWidth;
        const h = this.uiViewport.worldHeight;
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('游戏界面（占位符）', w / 2, h / 2);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('点击屏幕返回主菜单', w / 2, h - 30);
        this.uiViewport.endWorldRender(ctx);
    }
    _handleClick() {
        if (window.logger)
            logger.log('GAME', 'Screen clicked, going back to menu');
        // 使用 popScreen 返回上一个屏幕
        this.screenManager.popScreen();
    }
    _bindEvents() {
        this._onClick = () => this._handleClick();
        this.canvas.addEventListener('click', this._onClick);
        this.canvas.addEventListener('touchstart', this._onClick);
    }
    _unbindEvents() {
        if (this.canvas) {
            this.canvas.removeEventListener('click', this._onClick);
            this.canvas.removeEventListener('touchstart', this._onClick);
        }
    }
    handleBack() {
        if (window.logger)
            logger.log('GAME', 'handleBack called');
        // 使用 popScreen 返回上一个屏幕，而不是 replaceScreen
        // 这样不会创建新的 MenuScreen 实例，也不会增加栈深度
        return this.screenManager.popScreen();
    }
}
window.MenuScreen = MenuScreen;
window.GameScreen = GameScreen;
//# sourceMappingURL=menu-screen.js.map