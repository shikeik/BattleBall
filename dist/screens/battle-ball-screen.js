"use strict";
/**
 * BattleBallScreen - 球球大作战游戏场景
 * 第一阶段：基础框架
 *
 * 设计：
 * - UI 渲染使用 this.uiViewport（固定 540x960）
 * - 世界渲染使用 this.worldCamera（自定义，跟随玩家）
 */
class BattleBallScreen extends Screen {
    init() {
        this.canvas = document.getElementById('gameCanvas');
        // 地图配置
        this.mapSize = 4000;
        this.gridSize = 100;
        this.mapLeft = -this.mapSize / 2;
        this.mapRight = this.mapSize / 2;
        this.mapBottom = -this.mapSize / 2;
        this.mapTop = this.mapSize / 2;
        // 玩家
        this.player = {
            x: 0,
            y: 0,
            radius: 20,
            color: '#00ffff'
        };
        if (window.logger)
            logger.log('BATTLE', 'BattleBallScreen init');
    }
    /**
     * 初始化世界相机
     * 覆盖父类方法，使用自定义相机
     */
    _initWorldCamera() {
        this.worldCamera = {
            x: 0, // 相机中心 X
            y: 0, // 相机中心 Y
            zoom: 1.0, // 缩放级别
            width: this.screenWidth,
            height: this.screenHeight
        };
    }
    enter() {
        super.enter();
        this._bindEvents();
        if (window.logger)
            logger.log('BATTLE', 'BattleBallScreen enter');
    }
    exit() {
        super.exit();
        this._unbindEvents();
        if (window.logger)
            logger.log('BATTLE', 'BattleBallScreen exit');
    }
    render(delta) {
        if (!this.visible)
            return;
        if (!this.canvas)
            return;
        const ctx = this.canvas.getContext('2d');
        if (!ctx)
            return;
        // 更新世界相机位置跟随玩家
        this.worldCamera.x = this.player.x;
        this.worldCamera.y = this.player.y;
        // 清空画布
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 应用 DPR 缩放
        ctx.scale(this.dpr, this.dpr);
        // 计算世界渲染参数
        const zoom = this.worldCamera.zoom;
        const viewW = this.screenWidth / zoom;
        const viewH = this.screenHeight / zoom;
        // 保存状态
        ctx.save();
        // 应用世界相机变换
        // 1. 将屏幕中心设为原点
        // 2. 应用缩放
        // 3. 将相机位置移到屏幕中心
        ctx.translate(this.screenWidth / 2, this.screenHeight / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-this.worldCamera.x, -this.worldCamera.y);
        // 绘制世界背景
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(this.worldCamera.x - viewW / 2, this.worldCamera.y - viewH / 2, viewW, viewH);
        // 绘制网格（只绘制视口内的）
        this._renderGrid(ctx, viewW, viewH);
        // 绘制边界
        this._renderBoundary(ctx);
        // 绘制玩家
        this._renderPlayer(ctx);
        // 恢复状态
        ctx.restore();
        // 绘制 UI（使用 UI Viewport）
        this._renderUI(ctx);
    }
    /**
     * 绘制网格（只绘制视口内的部分）
     */
    _renderGrid(ctx, viewW, viewH) {
        const viewLeft = this.worldCamera.x - viewW / 2;
        const viewTop = this.worldCamera.y - viewH / 2;
        const viewRight = viewLeft + viewW;
        const viewBottom = viewTop + viewH;
        const gridColor = '#1a1a2e';
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        // 计算需要绘制的网格范围
        const startX = Math.floor((viewLeft - this.mapLeft) / this.gridSize) * this.gridSize + this.mapLeft;
        const startY = Math.floor((viewTop - this.mapBottom) / this.gridSize) * this.gridSize + this.mapBottom;
        const endX = Math.min(viewRight, this.mapRight);
        const endY = Math.min(viewBottom, this.mapTop);
        // 垂直线
        for (let x = startX; x <= endX; x += this.gridSize) {
            if (x < this.mapLeft)
                continue;
            ctx.beginPath();
            ctx.moveTo(x, Math.max(viewTop, this.mapBottom));
            ctx.lineTo(x, Math.min(viewBottom, this.mapTop));
            ctx.stroke();
        }
        // 水平线
        for (let y = startY; y <= endY; y += this.gridSize) {
            if (y < this.mapBottom)
                continue;
            ctx.beginPath();
            ctx.moveTo(Math.max(viewLeft, this.mapLeft), y);
            ctx.lineTo(Math.min(viewRight, this.mapRight), y);
            ctx.stroke();
        }
    }
    /**
     * 绘制边界
     */
    _renderBoundary(ctx) {
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.mapLeft, this.mapBottom, this.mapSize, this.mapSize);
    }
    /**
     * 绘制玩家
     */
    _renderPlayer(ctx) {
        const p = this.player;
        // 球体
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        // 边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    /**
     * 绘制 UI（使用 UI Viewport 坐标系）
     */
    _renderUI(ctx) {
        if (!this.uiViewport)
            return;
        // 应用 UI Viewport 变换
        this.uiViewport.apply(ctx);
        this.uiViewport.beginWorldRender(ctx);
        const w = this.uiViewport.worldWidth;
        const h = this.uiViewport.worldHeight;
        // 左上角信息
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Zoom: ${this.worldCamera.zoom.toFixed(2)}`, 20, 40);
        ctx.fillText(`Player: (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})`, 20, 65);
        // 底部提示
        ctx.fillStyle = '#888888';
        ctx.textAlign = 'center';
        ctx.fillText('点击屏幕返回主菜单', w / 2, h - 30);
        this.uiViewport.endWorldRender(ctx);
    }
    /**
     * 设置相机缩放
     */
    setCameraZoom(zoom) {
        this.worldCamera.zoom = Math.max(0.5, Math.min(3.0, zoom));
        if (window.logger)
            logger.log('BATTLE', `Camera zoom: ${this.worldCamera.zoom.toFixed(2)}`);
    }
    /**
     * 窗口大小变化
     */
    resize() {
        super.resize();
        if (window.logger)
            logger.log('BATTLE', `Resized to ${this.screenWidth}x${this.screenHeight}`);
    }
    /**
     * 绑定事件
     */
    _bindEvents() {
        // 窗口大小变化
        this._onResize = () => this.resize();
        window.addEventListener('resize', this._onResize);
        // 点击返回
        this._onClick = () => {
            if (window.logger)
                logger.log('BATTLE', 'Screen clicked, going back');
            this.screenManager.popScreen();
        };
        this.canvas.addEventListener('click', this._onClick);
    }
    /**
     * 解绑事件
     */
    _unbindEvents() {
        window.removeEventListener('resize', this._onResize);
        if (this.canvas) {
            this.canvas.removeEventListener('click', this._onClick);
        }
    }
    handleBack() {
        if (window.logger)
            logger.log('BATTLE', 'handleBack called');
        return this.screenManager.popScreen();
    }
}
window.BattleBallScreen = BattleBallScreen;
//# sourceMappingURL=battle-ball-screen.js.map