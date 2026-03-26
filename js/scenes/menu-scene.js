/**
 * MenuScene - 主菜单场景
 */
class MenuScene extends Scene {
	init() {
		this.buttons = [
			{ text: '开始游戏', action: () => this.startGame() },
			{ text: 'WebGPU 演示', action: () => this.showWebGPU() },
			{ text: '设置', action: () => this.openSettings() },
		];
		this.hoveredIndex = -1;
		this.canvas = document.getElementById('gameCanvas');
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

		// 清屏
		ctx.fillStyle = '#1a1a2e';
		ctx.fillRect(0, 0, w, h);

		// 标题
		ctx.fillStyle = '#eee';
		ctx.font = 'bold 48px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('BATTLE BALL', w / 2, h * 0.25);

		// 按钮
		const btnW = 200;
		const btnH = 50;
		const startY = h * 0.45;
		const gap = 70;

		this.buttons.forEach((btn, i) => {
			const x = (w - btnW) / 2;
			const y = startY + i * gap;
			const isHovered = i === this.hoveredIndex;

			// 按钮背景
			ctx.fillStyle = isHovered ? '#4a9eff' : '#16213e';
			ctx.fillRect(x, y, btnW, btnH);

			// 按钮边框
			ctx.strokeStyle = isHovered ? '#7ec8ff' : '#0f3460';
			ctx.lineWidth = 2;
			ctx.strokeRect(x, y, btnW, btnH);

			// 按钮文字
			ctx.fillStyle = isHovered ? '#fff' : '#aaa';
			ctx.font = '20px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(btn.text, w / 2, y + btnH / 2);
		});

		// 底部提示
		ctx.fillStyle = '#666';
		ctx.font = '14px sans-serif';
		ctx.fillText('点击按钮切换场景 | 返回键返回', w / 2, h - 30);
	}

	startGame() {
		if (window.logger) logger.log('MENU', 'Start game clicked');
		// 可以展示转场效果
		this.sceneManager.playTransition(() => {
			this.sceneManager.goScene(GameScene);
		});
	}

	showWebGPU() {
		if (window.logger) logger.log('MENU', 'WebGPU demo clicked');
		this.sceneManager.playTransition(() => {
			this.sceneManager.goScene(WebGPUScene);
		});
	}

	openSettings() {
		if (window.logger) logger.log('MENU', 'Settings clicked');
		this.sceneManager.goScene(SettingsScene);
	}

	handleBack() {
		// 主菜单不处理返回键，交给管理器处理
		return false;
	}

	_bindEvents() {
		this._onMouseMove = (e) => {
			const rect = this.canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const w = this.canvas.width;
			const h = this.canvas.height;
			const btnW = 200;
			const btnH = 50;
			const startY = h * 0.45;
			const gap = 70;

			let newHovered = -1;
			this.buttons.forEach((btn, i) => {
				const bx = (w - btnW) / 2;
				const by = startY + i * gap;
				if (x >= bx && x <= bx + btnW && y >= by && y <= by + btnH) {
					newHovered = i;
				}
			});

			if (newHovered !== this.hoveredIndex) {
				this.hoveredIndex = newHovered;
			}
		};

		this._onClick = (e) => {
			if (this.hoveredIndex >= 0) {
				this.buttons[this.hoveredIndex].action();
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

window.MenuScene = MenuScene;
