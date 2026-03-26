/**
 * SelectionScene - 选择屏基类
 * 原版逻辑：使用 Map 映射，null 值作为分隔线，全部触发 replace
 */
class SelectionScene extends Scene {
	constructor(sceneManager) {
		super(sceneManager);
		this.screenMapping = new Map();
		this.canvas = null;
		this.hoveredIndex = -1;
		this.buttons = []; // 只存储实际按钮（排除分隔线）
	}

	init() {
		this.canvas = document.getElementById('gameCanvas');
		this.initScreenMapping(this.screenMapping);
	}

	/**
	 * 子类必须实现：填充屏幕映射
	 * 使用示例：
	 *   map.set('开始游戏', GameScene);
	 *   map.set('分隔标题', null);  // null 作为分隔线
	 *   map.set('设置', SettingsScene);
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
		if (!this.canvas) return;
		const ctx = this.canvas.getContext('2d');
		if (!ctx) return;

		const w = this.canvas.width;
		const h = this.canvas.height;

		// 背景
		ctx.fillStyle = '#1a1a2e';
		ctx.fillRect(0, 0, w, h);

		// 绘制按钮列表
		this._drawButtons(ctx, w, h);
	}

	_drawButtons(ctx, w, h) {
		const btnH = 60;
		const btnW = 280;
		const margin = 20;
		const startY = h * 0.2;

		this.buttons = []; // 清空按钮列表
		let currentY = startY;
		let btnIndex = 0;

		for (const [title, sceneClass] of this.screenMapping) {
			if (sceneClass === null) {
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
					sceneClass
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
	onScreenSelected(sceneClass) {
		this.sceneManager.replaceScreen(sceneClass);
	}

	_bindEvents() {
		this._onMouseMove = (e) => {
			const rect = this.canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			let newHovered = -1;
			for (const btn of this.buttons) {
				if (x >= btn.x && x <= btn.x + btn.w &&
					y >= btn.y && y <= btn.y + btn.h) {
					newHovered = btn.index;
					break;
				}
			}

			if (newHovered !== this.hoveredIndex) {
				this.hoveredIndex = newHovered;
			}
		};

		this._onClick = (e) => {
			if (this.hoveredIndex >= 0 && this.hoveredIndex < this.buttons.length) {
				const btn = this.buttons[this.hoveredIndex];
				if (window.logger) logger.log('SELECT', `Selected: ${btn.sceneClass.name}`);
				this.onScreenSelected(btn.sceneClass);
			}
		};

		this.canvas.addEventListener('mousemove', this._onMouseMove);
		this.canvas.addEventListener('click', this._onClick);
	}

	_unbindEvents() {
		if (this.canvas) {
			this.canvas.removeEventListener('mousemove', this._onMouseMove);
			this.canvas.removeEventListener('click', this._onClick);
		}
	}
}

window.SelectionScene = SelectionScene;
