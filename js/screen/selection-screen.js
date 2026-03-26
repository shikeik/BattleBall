/**
 * SelectionScreen - 选择屏基类
 * 原版逻辑：使用 Map 映射，null 值作为分隔线，全部触发 replace
 */
class SelectionScreen extends Screen {
	constructor(screenManager) {
		super(screenManager);
		this.screenMapping = new Map();
		this.canvas = null;
		this.hoveredIndex = -1;
		this.buttons = []; // 只存储实际按钮（排除分隔线）
	}

	init() {
		this.canvas = document.getElementById('gameCanvas');
		this.initScreenMapping(this.screenMapping);
		
		// 检查 mapping 中的值
		for (const [key, value] of this.screenMapping) {
			if (value !== null && typeof value !== 'function') {
				console.error(`Invalid screen class for "${key}":`, value, typeof value);
			}
		}
	}

	/**
	 * 子类必须实现：填充屏幕映射
	 * 使用示例：
	 *   map.set('开始游戏', GameScreen);
	 *   map.set('分隔标题', null);  // null 作为分隔线
	 *   map.set('设置', SettingsScreen);
	 */
	initScreenMapping(map) {
		// 子类实现
	}

	enter() {
		super.enter();
		this._bindEvents();
	}

	exit() {
		super.exit();
		this._unbindEvents();
	}

	render(delta) {
		if (!this.visible) return;
		if (!this.canvas) return;
		const ctx = this.canvas.getContext('2d');
		if (!ctx) return;
		
		// 清空画布
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.scale(this.dpr, this.dpr);
		
		// 使用自己的 UI Viewport
		if (!this.uiViewport) return;
		this.uiViewport.apply(ctx);
		this.uiViewport.beginWorldRender(ctx);

		// 背景
		ctx.fillStyle = '#1a1a2e';
		ctx.fillRect(0, 0, this.uiViewport.worldWidth, this.uiViewport.worldHeight);

		// 绘制按钮列表
		this._drawButtons(ctx, this.uiViewport.worldWidth, this.uiViewport.worldHeight);
		
		// 结束世界坐标系渲染
		this.uiViewport.endWorldRender(ctx);
	}

	_drawButtons(ctx, w, h) {
		const btnH = 60;
		const btnW = 280;
		const margin = 20;
		const startY = h * 0.2;

		this.buttons = []; // 清空按钮列表
		let currentY = startY;
		let btnIndex = 0;

		for (const [title, screenClass] of this.screenMapping) {
			if (screenClass === null) {
				// 分隔线/标签
				ctx.fillStyle = '#0ff';
				ctx.font = '16px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText(title, w / 2, currentY + 10);
				currentY += 30;
			} else {
				// 按钮
				const x = (w - btnW) / 2;
				const isHovered = btnIndex === this.hoveredIndex;

				// 背景
				ctx.fillStyle = isHovered ? '#4a9eff' : '#16213e';
				ctx.fillRect(x, currentY, btnW, btnH);

				// 边框
				ctx.strokeStyle = isHovered ? '#7ec8ff' : '#0f3460';
				ctx.lineWidth = 2;
				ctx.strokeRect(x, currentY, btnW, btnH);

				// 文字
				ctx.fillStyle = isHovered ? '#fff' : '#aaa';
				ctx.font = '20px sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(title, w / 2, currentY + btnH / 2);

				// 记录按钮信息
				this.buttons.push({
					index: btnIndex,
					x,
					y: currentY,
					w: btnW,
					h: btnH,
					screenClass
				});

				btnIndex++;
				currentY += btnH + margin;
			}
		}
	}

	/**
	 * 屏幕选择回调（子类可重写拦截）
	 * 默认行为：replaceScreen
	 */
	onScreenSelected(screenClass) {
		if (window.logger) {
			logger.log('SELECT', 'onScreenSelected called');
			logger.log('SELECT', 'screenClass: ' + screenClass.name);
			logger.log('SELECT', 'this: ' + this.constructor.name);
			logger.log('SELECT', 'this.screenManager type: ' + typeof this.screenManager);
			logger.log('SELECT', 'this.screenManager constructor: ' + (this.screenManager ? this.screenManager.constructor.name : 'null'));
			logger.log('SELECT', 'has replaceScreen: ' + (this.screenManager && this.screenManager.replaceScreen ? 'YES' : 'NO'));
		}
		if (this.screenManager && this.screenManager.replaceScreen) {
			this.screenManager.replaceScreen(screenClass);
		} else {
			if (window.logger) logger.log('ERROR', 'screenManager.replaceScreen not available');
		}
	}

	_bindEvents() {
		// 转换屏幕坐标到世界坐标
		const getPointerPos = (clientX, clientY) => {
			if (!this.uiViewport) return { x: 0, y: 0 };
			
			const rect = this.canvas.getBoundingClientRect();
			const screenX = clientX - rect.left;
			const screenY = clientY - rect.top;
			return this.uiViewport.toWorld(screenX, screenY);
		};

		// 检查点击位置
		const checkHit = (x, y) => {
			for (const btn of this.buttons) {
				if (x >= btn.x && x <= btn.x + btn.w &&
					y >= btn.y && y <= btn.y + btn.h) {
					return btn.index;
				}
			}
			return -1;
		};

		// 鼠标移动（PC）
		this._onMouseMove = (e) => {
			const pos = getPointerPos(e.clientX, e.clientY);
			this.hoveredIndex = checkHit(pos.x, pos.y);
		};

		// 点击（PC）
		this._onClick = (e) => {
			const pos = getPointerPos(e.clientX, e.clientY);
			const index = checkHit(pos.x, pos.y);
			console.log('Click at', pos, 'hit index', index, 'buttons', this.buttons.length);
			if (index >= 0) {
				const btn = this.buttons[index];
				console.log('Selected:', btn.screenClass.name);
				if (window.logger) logger.log('SELECT', `Selected: ${btn.screenClass.name}`);
				this.onScreenSelected(btn.screenClass);
			}
		};

		// 触摸开始（移动端）
		this._onTouchStart = (e) => {
			e.preventDefault();
			const touch = e.touches[0];
			const pos = getPointerPos(touch.clientX, touch.clientY);
			this.hoveredIndex = checkHit(pos.x, pos.y);
		};

		// 触摸结束（移动端）
		this._onTouchEnd = (e) => {
			e.preventDefault();
			console.log('TouchEnd, hoveredIndex:', this.hoveredIndex);
			if (this.hoveredIndex >= 0) {
				const btn = this.buttons[this.hoveredIndex];
				console.log('Touch selected:', btn.screenClass.name);
				if (window.logger) logger.log('SELECT', `Selected: ${btn.screenClass.name}`);
				this.onScreenSelected(btn.screenClass);
				this.hoveredIndex = -1;
			}
		};

		this.canvas.addEventListener('mousemove', this._onMouseMove);
		this.canvas.addEventListener('click', this._onClick);
		this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
		this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: false });
	}

	_unbindEvents() {
		if (this.canvas) {
			this.canvas.removeEventListener('mousemove', this._onMouseMove);
			this.canvas.removeEventListener('click', this._onClick);
			this.canvas.removeEventListener('touchstart', this._onTouchStart);
			this.canvas.removeEventListener('touchend', this._onTouchEnd);
		}
	}
}

window.SelectionScreen = SelectionScreen;
