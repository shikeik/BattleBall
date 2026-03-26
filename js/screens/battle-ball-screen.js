/**
 * BattleBallScreen - 球球大作战游戏场景
 * 第一阶段：基础框架
 * 
 * 注意：此屏幕使用独立的相机系统，不共享 ScreenManager 的 viewport
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
		
		// 玩家（临时静态球）
		this.player = {
			x: 0,
			y: 0,
			radius: 20,
			color: '#00ffff'
		};
		
		// 独立相机系统
		this.camera = {
			x: 0,
			y: 0,
			zoom: 1.0,
			dpr: window.devicePixelRatio || 1
		};
		
		// 屏幕尺寸（逻辑像素）
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;
		
		if (window.logger) logger.log('BATTLE', 'BattleBallScreen initialized');
	}
	
	enter() {
		super.enter();
		this._updateScreenSize();
		this._bindEvents();
		if (window.logger) logger.log('BATTLE', 'BattleBallScreen enter');
	}
	
	exit() {
		super.exit();
		this._unbindEvents();
		if (window.logger) logger.log('BATTLE', 'BattleBallScreen exit');
	}
	
	/**
	 * 更新屏幕尺寸
	 */
	_updateScreenSize() {
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;
		this.camera.dpr = window.devicePixelRatio || 1;
	}
	
	render(delta) {
		if (!this.canvas) return;
		const ctx = this.canvas.getContext('2d');
		if (!ctx) return;
		
		// 更新相机位置跟随玩家
		this.camera.x = this.player.x;
		this.camera.y = this.player.y;
		
		// 清空画布
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		// 应用 DPR 缩放
		ctx.scale(this.camera.dpr, this.camera.dpr);
		
		// 计算视口参数
		const zoom = this.camera.zoom;
		const viewW = this.screenWidth / zoom;
		const viewH = this.screenHeight / zoom;
		const viewLeft = this.camera.x - viewW / 2;
		const viewTop = this.camera.y - viewH / 2;
		
		// 保存状态
		ctx.save();
		
		// 应用相机变换：先平移使相机中心对准屏幕中心，再缩放
		ctx.translate(this.screenWidth / 2, this.screenHeight / 2);
		ctx.scale(zoom, zoom);
		ctx.translate(-this.camera.x, -this.camera.y);
		
		// 绘制背景（地图背景色）
		ctx.fillStyle = '#0a0a1a';
		ctx.fillRect(viewLeft, viewTop, viewW, viewH);
		
		// 绘制网格
		this._renderGrid(ctx, viewLeft, viewTop, viewW, viewH);
		
		// 绘制边界
		this._renderBoundary(ctx);
		
		// 绘制玩家
		this._renderPlayer(ctx);
		
		// 恢复状态
		ctx.restore();
		
		// 绘制 UI（屏幕坐标，不受相机影响）
		this._renderUI(ctx);
	}
	
	/**
	 * 绘制网格（只绘制视口内的部分）
	 */
	_renderGrid(ctx, viewLeft, viewTop, viewW, viewH) {
		const gridColor = '#1a1a2e';
		ctx.strokeStyle = gridColor;
		ctx.lineWidth = 1;
		
		// 计算需要绘制的网格范围
		const startX = Math.floor((viewLeft - this.mapLeft) / this.gridSize) * this.gridSize + this.mapLeft;
		const startY = Math.floor((viewTop - this.mapBottom) / this.gridSize) * this.gridSize + this.mapBottom;
		const endX = viewLeft + viewW;
		const endY = viewTop + viewH;
		
		// 垂直线
		for (let x = startX; x <= endX && x <= this.mapRight; x += this.gridSize) {
			if (x < this.mapLeft) continue;
			ctx.beginPath();
			ctx.moveTo(x, Math.max(viewTop, this.mapBottom));
			ctx.lineTo(x, Math.min(endY, this.mapTop));
			ctx.stroke();
		}
		
		// 水平线
		for (let y = startY; y <= endY && y <= this.mapTop; y += this.gridSize) {
			if (y < this.mapBottom) continue;
			ctx.beginPath();
			ctx.moveTo(Math.max(viewLeft, this.mapLeft), y);
			ctx.lineTo(Math.min(endX, this.mapRight), y);
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
	 * 绘制 UI（屏幕坐标）
	 */
	_renderUI(ctx) {
		// 左上角信息
		ctx.fillStyle = '#ffffff';
		ctx.font = '16px sans-serif';
		ctx.textAlign = 'left';
		ctx.fillText(`Zoom: ${this.camera.zoom.toFixed(2)}`, 20, 30);
		ctx.fillText(`Player: (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})`, 20, 50);
		
		// 提示文字
		ctx.fillStyle = '#888888';
		ctx.textAlign = 'center';
		ctx.fillText('点击屏幕返回主菜单', this.screenWidth / 2, this.screenHeight - 30);
	}
	
	/**
	 * 设置相机缩放
	 */
	setCameraZoom(zoom) {
		this.camera.zoom = Math.max(0.5, Math.min(3.0, zoom));
		if (window.logger) logger.log('BATTLE', `Camera zoom: ${this.camera.zoom.toFixed(2)}`);
	}
	
	/**
	 * 绑定事件
	 */
	_bindEvents() {
		// 窗口大小变化
		this._onResize = () => this._updateScreenSize();
		window.addEventListener('resize', this._onResize);
		
		// 点击返回
		this._onClick = () => {
			if (window.logger) logger.log('BATTLE', 'Screen clicked, going back');
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
		if (window.logger) logger.log('BATTLE', 'handleBack called');
		return this.screenManager.popScreen();
	}
}

window.BattleBallScreen = BattleBallScreen;
