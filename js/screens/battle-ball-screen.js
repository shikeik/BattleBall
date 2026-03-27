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
			radius: 20,
			color: '#00ffff'
		};
		
		// 彩豆管理器
		this.beanManager = null;
		this.beansInitialized = false;
		
		// 摇杆
		this.joystick = null;
		
		// 玩家移动速度
		this.playerSpeed = 200; // 像素/秒
		
		if (window.logger) logger.log('BATTLE', 'BattleBallScreen init');
	}
	
	/**
	 * 初始化世界相机
	 * 覆盖父类方法，使用自定义相机
	 */
	_initWorldCamera() {
		this.worldCamera = {
			x: 0,           // 相机中心 X
			y: 0,           // 相机中心 Y
			zoom: 3.0,      // 默认缩放级别 (对应 viewScale=1，近距离)
			width: this.screenWidth,
			height: this.screenHeight
		};
	}
	
	enter() {
		super.enter();
		this._bindEvents();
		
		// 初始化摇杆
		this._initJoystick();
		
		// 初始化彩豆
		this._initBeans();
		
		if (window.logger) logger.log('BATTLE', 'BattleBallScreen enter');
	}
	
	/**
	 * 初始化彩豆
	 */
	async _initBeans() {
		if (this.beansInitialized) return;
		
		if (window.BeanManager) {
			this.beanManager = new BeanManager();
			
			// 初始化 WebGPU
			const success = await this.beanManager.initWebGPU();
			if (success) {
				try {
					// 生成彩豆
					this.beanManager.generateBeans();
					
					// 创建实例缓冲区
					this.beanManager._createInstanceBuffer();
					
					// 初始化渲染资源（使用 worldCanvas）
					const worldCanvas = document.getElementById('worldCanvas');
					if (!worldCanvas) {
						if (window.logger) logger.log('BATTLE', 'worldCanvas not found');
						return;
					}
					
					// 设置 worldCanvas 尺寸
					worldCanvas.style.width = this.screenWidth + 'px';
					worldCanvas.style.height = this.screenHeight + 'px';
					worldCanvas.width = Math.floor(this.screenWidth * this.dpr);
					worldCanvas.height = Math.floor(this.screenHeight * this.dpr);
					
					const resourcesOk = await this.beanManager.initRenderResources(worldCanvas);
					if (!resourcesOk) {
						if (window.logger) logger.log('BATTLE', 'initRenderResources failed');
						return;
					}
					
					this.beansInitialized = true;
					if (window.logger) logger.log('BATTLE', 'Beans initialized successfully');
				} catch (e) {
					if (window.logger) logger.log('BATTLE', `Bean init error: ${e.message}`);
				}
			} else {
				if (window.logger) logger.log('BATTLE', 'WebGPU init failed, beans disabled');
			}
		}
	}
	
	exit() {
		super.exit();
		this._unbindEvents();
		
		// 销毁摇杆
		if (this.joystick) {
			this.joystick.destroy();
			this.joystick = null;
		}
		
		if (window.logger) logger.log('BATTLE', 'BattleBallScreen exit');
	}
	
	render(delta) {
		if (!this.visible) return;
		
		// 更新世界相机位置跟随玩家
		this.worldCamera.x = this.player.x;
		this.worldCamera.y = this.player.y;
		
		// 1. 使用 WebGPU 渲染世界（彩豆）
		this._renderWorld();
		
		// 2. 使用 2D Canvas 渲染 UI
		const canvas = this.getCanvas();
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		// 清空 UI 画布（透明，因为世界在下面）
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// 应用 DPR 缩放
		ctx.scale(this.dpr, this.dpr);
		
		// 绘制 UI（网格、边界、玩家、摇杆、文字）
		this._renderGameUI(ctx);
		
		// 更新玩家位置
		this._updatePlayer(delta);
		
		// 检测吃掉的彩豆
		this._checkEatBeans();
	}
	
	/**
	 * 使用 WebGPU 渲染世界（彩豆）
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
	 * 使用 2D Canvas 渲染游戏 UI（网格、边界、玩家、摇杆）
	 */
	_renderGameUI(ctx) {
		const zoom = this.worldCamera.zoom;
		const viewW = this.screenWidth / zoom;
		const viewH = this.screenHeight / zoom;
		
		// 保存状态
		ctx.save();
		
		// 应用世界相机变换
		ctx.translate(this.screenWidth / 2, this.screenHeight / 2);
		ctx.scale(zoom, zoom);
		ctx.translate(-this.worldCamera.x, -this.worldCamera.y);
		
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
			if (x < this.mapLeft) continue;
			ctx.beginPath();
			ctx.moveTo(x, Math.max(viewTop, this.mapBottom));
			ctx.lineTo(x, Math.min(viewBottom, this.mapTop));
			ctx.stroke();
		}
		
		// 水平线
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
	 * 绘制彩豆
	 */
	_renderBeans() {
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
	 * 绘制 UI（使用 UI Viewport 坐标系）
	 */
	_renderUI(ctx) {
		if (!this.uiViewport) return;
		
		// 应用 UI Viewport 变换
		this.uiViewport.apply(ctx);
		this.uiViewport.beginWorldRender(ctx);
		
		const w = this.uiViewport.worldWidth;
		const h = this.uiViewport.worldHeight;
		
		// 获取安全区域，避开工具条
		const safeArea = this.getSafeArea ? this.getSafeArea() : { x: 0, y: 0 };
		const uiX = safeArea.x + 20;
		const uiY = safeArea.y + 20;
		
		// 左上角信息
		ctx.fillStyle = '#ffffff';
		ctx.font = '16px sans-serif';
		ctx.textAlign = 'left';
		ctx.fillText(`Zoom: ${this.worldCamera.zoom.toFixed(2)}`, uiX, uiY);
		ctx.fillText(`Player: (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})`, uiX, uiY + 25);
		ctx.fillText(`Radius: ${this.player.radius.toFixed(1)}`, uiX, uiY + 50);
		if (this.beanManager) {
			ctx.fillText(`Eaten: ${this.beanManager.eatenCount}`, uiX, uiY + 75);
		}
		
		// 底部提示
		ctx.fillStyle = '#888888';
		ctx.textAlign = 'center';
		ctx.fillText('使用工具条返回按钮退出', w / 2, h - 30);
		
		// 绘制摇杆
		if (this.joystick) {
			this.joystick.render(ctx, w, h);
		}
		
		this.uiViewport.endWorldRender(ctx);
	}
	
	/**
	 * 设置相机缩放
	 * @param {number} viewScale - 视野大小系数 (1-10)
	 *   1 = 3x 放大效果（近距离）
	 *   10 = 总览全图甚至更大（远距离）
	 */
	setCameraZoom(viewScale) {
		// 将 1-10 映射到 3.0-0.08 的 zoom 值
		// 1 -> 3.0x (放大，近距离)
		// 10 -> 0.08x (缩小，远距离，能看到整个 4000x4000 地图甚至更大)
		const normalized = Math.max(1, Math.min(10, viewScale));
		const zoom = 3.0 - (normalized - 1) * (2.92 / 9); // 从 3.0 降到 0.08
		this.worldCamera.zoom = zoom;
		if (window.logger) logger.log('BATTLE', `Camera zoom: ${zoom.toFixed(2)} (viewScale: ${normalized})`);
	}
	
	/**
	 * resize 回调
	 * 基类已经处理了 Viewport 和 canvas 尺寸更新
	 * 这里只需要处理世界相机的特殊逻辑
	 */	onResize() {
		// 世界相机的宽高已经在基类 resize 中更新
		// 这里可以添加额外的逻辑，如保持中心点等
		
		// 同步更新 worldCanvas 尺寸
		const worldCanvas = document.getElementById('worldCanvas');
		if (worldCanvas) {
			worldCanvas.style.width = this.screenWidth + 'px';
			worldCanvas.style.height = this.screenHeight + 'px';
			worldCanvas.width = Math.floor(this.screenWidth * this.dpr);
			worldCanvas.height = Math.floor(this.screenHeight * this.dpr);
		}
		
		if (window.logger) {
			const isLandscape = this.screenWidth > this.screenHeight;
			logger.log('BATTLE', `onResize: ${this.screenWidth}x${this.screenHeight} (${isLandscape ? 'landscape' : 'portrait'})`);
		}
	}
	
	/**
	 * 初始化摇杆
	 */
	_initJoystick() {
		if (!window.Joystick) return;
		
		this.joystick = new Joystick({
			onMove: (dx, dy) => {
				// 摇杆移动回调
			},
			onEnd: () => {
				// 摇杆释放回调
			}
		});
	}
	
	/**
	 * 更新玩家位置
	 */
	_updatePlayer(delta) {
		if (!this.joystick) return;
		
		// 根据摇杆输入移动玩家
		const moveX = this.joystick.dx * this.playerSpeed * delta;
		const moveY = this.joystick.dy * this.playerSpeed * delta;
		
		this.player.x += moveX;
		this.player.y += moveY;
		
		// 限制在地图范围内
		const margin = this.player.radius;
		this.player.x = Math.max(this.mapLeft + margin, Math.min(this.mapRight - margin, this.player.x));
		this.player.y = Math.max(this.mapBottom + margin, Math.min(this.mapTop - margin, this.player.y));
	}
	
	/**
	 * 检测吃掉的彩豆
	 */
	_checkEatBeans() {
		if (!this.beanManager || !this.beansInitialized) return;
		
		const eaten = this.beanManager.eatBeans(
			this.player.x,
			this.player.y,
			this.player.radius
		);
		
		if (eaten > 0) {
			// 玩家成长
			const growth = eaten * 0.1;
			this.player.radius = Math.min(100, this.player.radius + growth);
			
			if (window.logger) {
				logger.log('BATTLE', `Ate ${eaten} beans, radius: ${this.player.radius.toFixed(1)}`);
			}
		}
	}
	
	/**
	 * 绑定事件
	 */
	_bindEvents() {
		// 不再绑定点击返回事件，避免误触
		// 返回只能通过工具条返回按钮或物理返回键
	}
	
	/**
	 * 解绑事件
	 */
	_unbindEvents() {
		// 无事件需要解绑
	}
	
	handleBack() {
		if (window.logger) logger.log('BATTLE', 'handleBack called');
		return this.screenManager.popScreen();
	}
}

window.BattleBallScreen = BattleBallScreen;
