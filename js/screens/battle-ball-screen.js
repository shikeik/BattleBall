/**
 * BattleBallScreen - 球球大作战游戏场景
 * 第一阶段：基础框架
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
		
		// 相机缩放
		this.cameraZoom = 1.0;
		
		if (window.logger) logger.log('BATTLE', 'BattleBallScreen initialized');
	}
	
	enter() {
		super.enter();
		this._bindEvents();
		if (window.logger) logger.log('BATTLE', 'BattleBallScreen enter');
	}
	
	exit() {
		super.exit();
		this._unbindEvents();
		if (window.logger) logger.log('BATTLE', 'BattleBallScreen exit');
	}
	
	render(delta) {
		if (!this.canvas) return;
		const ctx = this.canvas.getContext('2d');
		if (!ctx) return;
		
		const viewport = this.getViewport();
		if (!viewport) return;
		
		// 保存原始变换
		ctx.save();
		
		// 计算相机变换（不修改 viewport 的共享状态）
		const scale = this.cameraZoom;
		const offsetX = viewport.screenWidth / 2 - this.player.x * scale;
		const offsetY = viewport.screenHeight / 2 - this.player.y * scale;
		
		// 应用 DPR 缩放
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(viewport.dpr, viewport.dpr);
		
		// 绘制背景（屏幕坐标）
		ctx.fillStyle = '#0a0a1a';
		ctx.fillRect(0, 0, viewport.screenWidth, viewport.screenHeight);
		
		// 应用相机变换（世界坐标）
		ctx.translate(offsetX, offsetY);
		ctx.scale(scale, scale);
		
		// 绘制网格
		this._renderGrid(ctx);
		
		// 绘制边界
		this._renderBoundary(ctx);
		
		// 绘制玩家
		this._renderPlayer(ctx);
		
		// 恢复变换
		ctx.restore();
	}
	
	/**
	 * 绘制网格
	 */
	_renderGrid(ctx) {
		const gridColor = '#1a1a2e';
		ctx.strokeStyle = gridColor;
		ctx.lineWidth = 1;
		
		// 垂直线
		for (let x = this.mapLeft; x <= this.mapRight; x += this.gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, this.mapBottom);
			ctx.lineTo(x, this.mapTop);
			ctx.stroke();
		}
		
		// 水平线
		for (let y = this.mapBottom; y <= this.mapTop; y += this.gridSize) {
			ctx.beginPath();
			ctx.moveTo(this.mapLeft, y);
			ctx.lineTo(this.mapRight, y);
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
	 * 设置相机缩放
	 */
	setCameraZoom(zoom) {
		this.cameraZoom = Math.max(0.5, Math.min(3.0, zoom));
		if (window.logger) logger.log('BATTLE', `Camera zoom: ${this.cameraZoom.toFixed(2)}`);
	}
	
	/**
	 * 绑定事件
	 */
	_bindEvents() {
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
