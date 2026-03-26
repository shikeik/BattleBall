/**
 * SettingsScreen - 设置界面
 */
class SettingsScreen extends Screen {
	init() {
		this.canvas = document.getElementById('gameCanvas');
		this.settings = [
			{ name: 'sound', label: '音效', value: true },
			{ name: 'music', label: '音乐', value: true },
			{ name: 'fps', label: '显示FPS', value: true },
		];
		this.hoveredIndex = -1;
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
		ctx.fillStyle = '#16213e';
		ctx.fillRect(0, 0, w, h);

		// 标题
		ctx.fillStyle = '#eee';
		ctx.font = 'bold 36px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('设置', w / 2, 80);

		// 设置项
		const itemH = 60;
		const startY = 150;
		const itemW = Math.min(400, w - 40);
		const itemX = (w - itemW) / 2;

		this.settings.forEach((setting, i) => {
			const y = startY + i * (itemH + 20);
			const isHovered = i === this.hoveredIndex;

			// 背景
			ctx.fillStyle = isHovered ? '#0f3460' : '#1a1a2e';
			ctx.fillRect(itemX, y, itemW, itemH);

			// 边框
			ctx.strokeStyle = isHovered ? '#4a9eff' : '#333';
			ctx.lineWidth = 2;
			ctx.strokeRect(itemX, y, itemW, itemH);

			// 标签
			ctx.fillStyle = '#eee';
			ctx.font = '20px sans-serif';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.fillText(setting.label, itemX + 20, y + itemH / 2);

			// 开关状态
			const switchW = 60;
			const switchH = 30;
			const switchX = itemX + itemW - switchW - 20;
			const switchY = y + (itemH - switchH) / 2;

			// 开关背景
			ctx.fillStyle = setting.value ? '#4caf50' : '#666';
			ctx.beginPath();
			ctx.roundRect(switchX, switchY, switchW, switchH, switchH / 2);
			ctx.fill();

			// 开关圆点
			const dotR = switchH - 6;
			const dotX = setting.value ? switchX + switchW - dotR - 3 : switchX + 3;
			const dotY = switchY + 3;

			ctx.fillStyle = '#fff';
			ctx.beginPath();
			ctx.arc(dotX + dotR / 2, dotY + dotR / 2, dotR / 2, 0, Math.PI * 2);
			ctx.fill();
		});

		// 返回按钮
		this._renderBackButton(ctx, w, h);

		// 底部提示
		ctx.fillStyle = '#666';
		ctx.font = '14px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('点击设置项切换开关 | 返回键返回', w / 2, h - 30);
	}

	_renderBackButton(ctx, w, h) {
		const btnW = 120;
		const btnH = 40;
		const x = (w - btnW) / 2;
		const y = h - 100;
		const isHovered = this.hoveredIndex === -2; // -2 表示返回按钮

		ctx.fillStyle = isHovered ? '#e94560' : '#c73e54';
		ctx.fillRect(x, y, btnW, btnH);

		ctx.strokeStyle = isHovered ? '#ff6b6b' : '#a03045';
		ctx.lineWidth = 2;
		ctx.strokeRect(x, y, btnW, btnH);

		ctx.fillStyle = '#fff';
		ctx.font = '18px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('返回', w / 2, y + btnH / 2);
	}

	toggleSetting(index) {
		if (index >= 0 && index < this.settings.length) {
			const setting = this.settings[index];
			setting.value = !setting.value;
			if (window.logger) logger.log('SETTINGS', `${setting.label} = ${setting.value}`);
		}
	}

	handleBack() {
		this.screenManager.popScreen();
		return true;
	}

	_bindEvents() {
		this._onMouseMove = (e) => {
			const rect = this.canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const w = this.canvas.width;
			const h = this.canvas.height;

			// 检查设置项悬停
			const itemH = 60;
			const startY = 150;
			const itemW = Math.min(400, w - 40);
			const itemX = (w - itemW) / 2;

			let newHovered = -1;
			this.settings.forEach((setting, i) => {
				const iy = startY + i * (itemH + 20);
				if (x >= itemX && x <= itemX + itemW && y >= iy && y <= iy + itemH) {
					newHovered = i;
				}
			});

			// 检查返回按钮悬停
			const btnW = 120;
			const btnH = 40;
			const bx = (w - btnW) / 2;
			const by = h - 100;
			if (x >= bx && x <= bx + btnW && y >= by && y <= by + btnH) {
				newHovered = -2;
			}

			if (newHovered !== this.hoveredIndex) {
				this.hoveredIndex = newHovered;
			}
		};

		this._onClick = (e) => {
			if (this.hoveredIndex === -2) {
				// 返回按钮
				this.handleBack();
			} else if (this.hoveredIndex >= 0) {
				this.toggleSetting(this.hoveredIndex);
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

window.SettingsScreen = SettingsScreen;
