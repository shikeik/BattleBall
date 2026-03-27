/**
 * BattleBallScreen - 球球大作战游戏场景
 * 
 * 设计：
 * - UI 渲染使用 this.uiViewport（固定 540x960）
 * - 世界渲染使用 this.worldCamera（自定义，跟随玩家）
 */
class BattleBallScreen extends Screen {
	init() {
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
			score: 0,
			radius: 10,
			color: '#00ffff'
		};
		
		// 彩豆管理器
		this.beanManager = null;
		this.beansInitialized = false;
		
		// 摇杆
		this.joystick = null;
		
		// 玩家移动速度
		this.playerSpeed = 200;
		
		// 吃豆冷却
		this.eatCooldown = 0;
		this.eatCooldownTime = 0.1;
	}
	
	/**
	 * 初始化世界相机
	 */
	_initWorldCamera() {
		this.worldCamera = {
			x: 0,
			y: 0,
			zoom: 3.0,
			width: this.screenWidth,
			height: this.screenHeight
		};
	}
	
	enter() {
		super.enter();
		this._bindEvents();
		
		// 初始化相机缩放
		this._initCameraZoom();
		
		// 初始化摇杆
		this._initJoystick();
		
		// 初始化彩豆
		this._initBeans();
	}
	
	/**
	 * 初始化相机缩放
	 */
	_initCameraZoom() {
		const slider = document.getElementById('camera-zoom-slider');
		if (slider) {
			const viewScale = parseFloat(slider.value);
			this.setCameraZoom(viewScale);
		}
	}
	
	/**
	 * 初始化彩豆
	 */
	async _initBeans() {
		if (this.beansInitialized) return;
		
		if (window.BeanManager) {
			this.beanManager = new BeanManager();
			
			const success = await this.beanManager.initWebGPU();
			if (success) {
				try {
					this.beanManager.generateBeans();
					this.beanManager._createInstanceBuffer();
					
					const worldCanvas = document.getElementById('worldCanvas');
					if (!worldCanvas) return;
					
					worldCanvas.style.width = this.screenWidth + 'px';
					worldCanvas.style.height = this.screenHeight + 'px';
					worldCanvas.width = Math.floor(this.screenWidth * this.dpr);
					worldCanvas.height = Math.floor(this.screenHeight * this.dpr);
					
					const resourcesOk = await this.beanManager.initRenderResources(worldCanvas);
					if (!resourcesOk) return;
					
					this.beansInitialized = true;
				} catch (e) {
					// 静默失败
				}
			}
		}
	}
	
	exit() {
		super.exit();
		this._unbindEvents();
		
		if (this.joystick) {
			this.joystick.destroy();
			this.joystick = null;
		}
	}
	
	render(delta) {
		if (!this.visible) return;
		
		// 更新世界相机位置
		this.worldCamera.x = this.player.x;
		this.worldCamera.y = this.player.y;
		
		// 渲染世界（WebGPU）
		this._renderWorld();
		
		// 渲染 UI（2D Canvas）
		const canvas = this.getCanvas();
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.scale(this.dpr, this.dpr);
		
		this._renderGameUI(ctx);
		
		// 更新玩家
		this._updatePlayer(delta);
		this._checkEatBeans(delta);
	}
	
	/**
	 * 渲染世界（WebGPU）
	 */
	_renderWorld() {
		if (!this.beanManager || !this.beansInitialized) return;
		
		this.beanManager.render(
			this.worldCamera.x,
			this.worldCamera.y,
			this.worldCamera.zoom,
			this.screenWidth,
			this.screenHeight
		);
	}
	
	/**
	 * 渲染游戏 UI
	 */
	_renderGameUI(ctx) {
		const zoom = this.worldCamera.zoom;
		const viewW = this.screenWidth / zoom;
		const viewH = this.screenHeight / zoom;
		
		ctx.save();
		
		ctx.translate(this.screenWidth / 2, this.screenHeight / 2);
		ctx.scale(zoom, zoom);
		ctx.translate(-this.worldCamera.x, -this.worldCamera.y);
		
		this._renderGrid(ctx, viewW, viewH);
		this._renderBoundary(ctx);
		this._renderPlayer(ctx);
		
		ctx.restore();
		
		this._renderUI(ctx);
	}
	
	/**
	 * 绘制网格
	 */
	_renderGrid(ctx, viewW, viewH) {
		const viewLeft = this.worldCamera.x - viewW / 2;
		const viewTop = this.worldCamera.y - viewH / 2;
		const viewRight = viewLeft + viewW;
		const viewBottom = viewTop + viewH;
		
		ctx.strokeStyle = '#1a1a2e';
		ctx.lineWidth = 1;
		
		const startX = Math.floor((viewLeft - this.mapLeft) / this.gridSize) * this.gridSize + this.mapLeft;
		const startY = Math.floor((viewTop - this.mapBottom) / this.gridSize) * this.gridSize + this.mapBottom;
		const endX = Math.min(viewRight, this.mapRight);
		const endY = Math.min(viewBottom, this.mapTop);
		
		for (let x = startX; x <= endX; x += this.gridSize) {
			if (x < this.mapLeft) continue;
			ctx.beginPath();
			ctx.moveTo(x, Math.max(viewTop, this.mapBottom));
			ctx.lineTo(x, Math.min(viewBottom, this.mapTop));
			ctx.stroke();
		}
		
		for (let y = startY; y <= endY; y += this.gridSize) {
			if (y < this.mapBottom) continue;
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
		
		ctx.fillStyle = p.color;
		ctx.beginPath();
		ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
		ctx.fill();
		
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;
		ctx.stroke();
	}
	
	/**
	 * 绘制 UI
	 */
	_renderUI(ctx) {
		if (!this.uiViewport) return;
		
		this.uiViewport.apply(ctx);
		this.uiViewport.beginWorldRender(ctx);
		
		const w = this.uiViewport.worldWidth;
		const h = this.uiViewport.worldHeight;
		
		const safeArea = this.getSafeArea ? this.getSafeArea() : { x: 0, y: 0 };
		const uiX = safeArea.x + 20;
		const uiY = safeArea.y + 20;
		
		ctx.fillStyle = '#ffffff';
		ctx.font = '16px sans-serif';
		ctx.textAlign = 'left';
		ctx.fillText(`Zoom: ${this.worldCamera.zoom.toFixed(2)}`, uiX, uiY);
		ctx.fillText(`Player: (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})`, uiX, uiY + 25);
		ctx.fillText(`Radius: ${this.player.radius.toFixed(1)}`, uiX, uiY + 50);
		if (this.beanManager) {
			ctx.fillText(`Eaten: ${this.beanManager.eatenCount}`, uiX, uiY + 75);
		}
		
		ctx.fillStyle = '#888888';
		ctx.textAlign = 'center';
		ctx.fillText('使用工具条返回按钮退出', w / 2, h - 30);
		
		if (this.joystick) {
			this.joystick.render(ctx, w, h);
		}
		
		this.uiViewport.endWorldRender(ctx);
	}
	
	/**
	 * 设置相机缩放
	 */
	setCameraZoom(viewScale) {
		const normalized = Math.max(1, Math.min(10, viewScale));
		const zoom = 3.0 - (normalized - 1) * (2.92 / 9);
		this.worldCamera.zoom = zoom;
	}
	
	/**
	 * resize 回调
	 */
	onResize() {
		const worldCanvas = document.getElementById('worldCanvas');
		if (worldCanvas) {
			worldCanvas.style.width = this.screenWidth + 'px';
			worldCanvas.style.height = this.screenHeight + 'px';
			worldCanvas.width = Math.floor(this.screenWidth * this.dpr);
			worldCanvas.height = Math.floor(this.screenHeight * this.dpr);
		}
	}
	
	/**
	 * 初始化摇杆
	 */
	_initJoystick() {
		if (!window.Joystick) return;
		
		this.joystick = new Joystick({
			onMove: (dx, dy) => {},
			onEnd: () => {}
		});
	}
	
	/**
	 * 更新玩家位置
	 */
	_updatePlayer(delta) {
		if (!this.joystick) return;
		
		const moveX = this.joystick.dx * this.playerSpeed * delta;
		const moveY = this.joystick.dy * this.playerSpeed * delta;
		
		this.player.x += moveX;
		this.player.y += moveY;
		
		const margin = this.player.radius;
		this.player.x = Math.max(this.mapLeft + margin, Math.min(this.mapRight - margin, this.player.x));
		this.player.y = Math.max(this.mapBottom + margin, Math.min(this.mapTop - margin, this.player.y));
	}
	
	/**
	 * 检测吃掉的彩豆
	 */
	_checkEatBeans(delta) {
		if (!this.beanManager || !this.beansInitialized) return;
		
		if (this.eatCooldown > 0) {
			this.eatCooldown -= delta;
			return;
		}
		
		const eaten = this.beanManager.eatBeans(
			this.player.x,
			this.player.y,
			this.player.radius
		);
		
		if (eaten > 0) {
			this.player.score += eaten;
			this.player.radius = this._scoreToRadius(this.player.score);
			this.eatCooldown = this.eatCooldownTime;
		}
	}
	
	/**
	 * 积分转半径
	 */
	_scoreToRadius(score) {
		return 10 + Math.sqrt(score) * 2;
	}
	
	_bindEvents() {}
	_unbindEvents() {}
	
	handleBack() {
		return this.screenManager.popScreen();
	}
}

window.BattleBallScreen = BattleBallScreen;
