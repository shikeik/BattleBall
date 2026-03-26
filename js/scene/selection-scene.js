/**
 * SelectionScene - 选择屏基类
 * 用于快速创建菜单、选择界面
 * 子类只需实现 initSelectionItems() 方法定义选项
 */
class SelectionScene extends Scene {
	constructor(sceneManager) {
		super(sceneManager);
		this.items = [];
		this.hoveredIndex = -1;
		this.title = '';
		this.canvas = null;
		this.ctx = null;
	}

	init() {
		this.canvas = document.getElementById('gameCanvas');
		this.initSelectionItems();
	}

	/**
	 * 子类必须实现：初始化选项列表
	 * 示例：
	 *   this.title = '主菜单';
	 *   this.addItem('开始游戏', () => this.goScene(GameScene));
	 *   this.addItem('设置', () => this.goScene(SettingsScene));
	 */
	initSelectionItems() {
		// 子类实现
	}

	/**
	 * 添加选项
	 * @param {string} label - 显示文本
	 * @param {Function} callback - 点击回调
	 * @param {Object} options - 选项配置
	 */
	addItem(label, callback, options = {}) {
		this.items.push({
			label,
			callback,
			enabled: options.enabled !== false,
			color: options.color || null,
			subtitle: options.subtitle || null
		});
	}

	/**
	 * 添加分隔线/分组标题
	 */
	addSeparator(text) {
		this.items.push({
			isSeparator: true,
			label: text || ''
		});
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
		this.ctx = this.canvas.getContext('2d');
		if (!this.ctx) return;

		const w = this.canvas.width;
		const h = this.canvas.height;

		// 背景
		this._drawBackground(w, h);

		// 标题
		if (this.title) {
			this._drawTitle(w, h);
		}

		// 选项列表
		this._drawItems(w, h);

		// 底部提示
		this._drawFooter(w, h);
	}

	_drawBackground(w, h) {
		this.ctx.fillStyle = '#1a1a2e';
		this.ctx.fillRect(0, 0, w, h);
	}

	_drawTitle(w, h) {
		this.ctx.fillStyle = '#eee';
		this.ctx.font = 'bold 36px sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.fillText(this.title, w / 2, h * 0.15);
	}

	_drawItems(w, h) {
		const itemH = 50;
		const itemW = Math.min(300, w - 40);
		const startY = this.title ? h * 0.25 : h * 0.15;
		const gap = 15;

		this.itemLayout = [];

		let currentY = startY;
		this.items.forEach((item, i) => {
			if (item.isSeparator) {
				// 分隔线
				if (item.label) {
					this.ctx.fillStyle = '#888';
					this.ctx.font = '14px sans-serif';
					this.ctx.textAlign = 'center';
					this.ctx.fillText(item.label, w / 2, currentY + 10);
					currentY += 25;
				} else {
					this.ctx.strokeStyle = '#333';
					this.ctx.lineWidth = 1;
					this.ctx.beginPath();
					this.ctx.moveTo(w * 0.2, currentY);
					this.ctx.lineTo(w * 0.8, currentY);
					this.ctx.stroke();
					currentY += 20;
				}
			} else {
				// 按钮
				const x = (w - itemW) / 2;
				const isHovered = i === this.hoveredIndex;
				const isEnabled = item.enabled;

				// 背景
				if (isEnabled) {
					this.ctx.fillStyle = isHovered ? '#4a9eff' : '#16213e';
				} else {
					this.ctx.fillStyle = '#222';
				}
				this.ctx.fillRect(x, currentY, itemW, itemH);

				// 边框
				if (isEnabled) {
					this.ctx.strokeStyle = isHovered ? '#7ec8ff' : (item.color || '#0f3460');
				} else {
					this.ctx.strokeStyle = '#333';
				}
				this.ctx.lineWidth = 2;
				this.ctx.strokeRect(x, currentY, itemW, itemH);

				// 文字
				if (isEnabled) {
					this.ctx.fillStyle = isHovered ? '#fff' : '#aaa';
				} else {
					this.ctx.fillStyle = '#555';
				}
				this.ctx.font = '18px sans-serif';
				this.ctx.textAlign = 'center';
				this.ctx.textBaseline = 'middle';
				this.ctx.fillText(item.label, w / 2, currentY + itemH / 2);

				// 副标题
				if (item.subtitle) {
					this.ctx.fillStyle = '#666';
					this.ctx.font = '12px sans-serif';
					this.ctx.fillText(item.subtitle, w / 2, currentY + itemH + 12);
					currentY += 15;
				}

				// 记录布局信息用于点击检测
				this.itemLayout.push({
					index: i,
					x: x,
					y: currentY,
					w: itemW,
					h: itemH,
					enabled: isEnabled
				});

				currentY += itemH + gap;
			}
		});
	}

	_drawFooter(w, h) {
		this.ctx.fillStyle = '#666';
		this.ctx.font = '14px sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'alphabetic';

		const hint = this.getFooterHint();
		this.ctx.fillText(hint, w / 2, h - 20);
	}

	/**
	 * 子类可覆盖底部提示文字
	 */
	getFooterHint() {
		return '点击选择 | ESC 返回';
	}

	/**
	 * 导航到场景（入栈）
	 */
	goScene(sceneClass) {
		this.sceneManager.goScene(sceneClass);
	}

	/**
	 * 返回上个场景
	 */
	goBack() {
		this.sceneManager.popScene();
	}

	handleBack() {
		this.goBack();
		return true;
	}

	_bindEvents() {
		this._onMouseMove = (e) => {
			const rect = this.canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			let newHovered = -1;
			if (this.itemLayout) {
				for (const item of this.itemLayout) {
					if (item.enabled &&
						x >= item.x && x <= item.x + item.w &&
						y >= item.y && y <= item.y + item.h) {
						newHovered = item.index;
						break;
					}
				}
			}

			if (newHovered !== this.hoveredIndex) {
				this.hoveredIndex = newHovered;
			}
		};

		this._onClick = (e) => {
			if (this.hoveredIndex >= 0) {
				const item = this.items[this.hoveredIndex];
				if (item && item.callback && item.enabled) {
					if (window.logger) logger.log('SELECT', `Selected: ${item.label}`);
					item.callback();
				}
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
