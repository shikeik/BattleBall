/**
 * MenuScreen - 主菜单界面
 * 极简版本：只有两个按钮，进入空场景A或B
 */

class MenuScreen extends GScreen {
	private buttons: Array<{ text: string; x: number; y: number; width: number; height: number; action: () => void }>;
	private hoveredIndex: number;

	constructor(screenManager?: any) {
		super(screenManager);
		this.buttons = [];
		this.hoveredIndex = -1;
	}

	init(): void {
		this.setupButtons();
	}

	private setupButtons(): void {
		this.buttons = [
			{
				text: '场景 A',
				x: 0,
				y: 0,
				width: 200,
				height: 60,
				action: () => this.goToScreenA()
			},
			{
				text: '场景 B',
				x: 0,
				y: 0,
				width: 200,
				height: 60,
				action: () => this.goToScreenB()
			}
		];
	}

	enter(): void {
		super.enter();
		this._bindEvents();
		if (window.logger) {
			window.logger.log('MENU', 'MenuScreen entered');
		}
	}

	exit(): void {
		super.exit();
		this._unbindEvents();
	}

	render(_delta: number): void {
		if (!this.visible) return;
		
		const canvas = this.getCanvas();
		if (!canvas) return;
		
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		// 清空画布
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.scale(this.dpr, this.dpr);
		
		// 背景
		ctx.fillStyle = '#1a1a2e';
		ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
		
		// 标题
		ctx.fillStyle = '#0ff';
		ctx.font = 'bold 32px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('选择场景', this.screenWidth / 2, 150);
		
		// 计算按钮位置（垂直居中）
		const startY = this.screenHeight / 2 - 80;
		const gap = 100;
		
		this.buttons.forEach((btn, index) => {
			btn.x = (this.screenWidth - btn.width) / 2;
			btn.y = startY + index * gap;
			
			const isHovered = index === this.hoveredIndex;
			
			// 按钮背景
			ctx.fillStyle = isHovered ? '#0f3460' : '#1a1a2e';
			ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
			
			// 按钮边框
			ctx.strokeStyle = isHovered ? '#4a9eff' : '#0ff';
			ctx.lineWidth = 2;
			ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
			
			// 按钮文字
			ctx.fillStyle = '#fff';
			ctx.font = '20px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(
				btn.text,
				btn.x + btn.width / 2,
				btn.y + btn.height / 2
			);
		});
		
		// 底部提示
		ctx.fillStyle = '#666';
		ctx.font = '14px sans-serif';
		ctx.fillText('点击按钮进入场景', this.screenWidth / 2, this.screenHeight - 100);
	}

	private goToScreenA(): void {
		if (window.logger) {
			window.logger.log('MENU', 'Going to Scene A');
		}
		if (this.screenManager) {
			this.screenManager.goScreen(SceneA);
		}
	}

	private goToScreenB(): void {
		if (window.logger) {
			window.logger.log('MENU', 'Going to Scene B');
		}
		if (this.screenManager) {
			this.screenManager.goScreen(SceneB);
		}
	}

	private _bindEvents(): void {
		const canvas = this.getCanvas();
		if (!canvas) return;
		
		canvas.addEventListener('mousemove', this._onMouseMove);
		canvas.addEventListener('click', this._onClick);
	}

	private _unbindEvents(): void {
		const canvas = this.getCanvas();
		if (!canvas) return;
		
		canvas.removeEventListener('mousemove', this._onMouseMove);
		canvas.removeEventListener('click', this._onClick);
	}

	private _onMouseMove = (e: MouseEvent): void => {
		const rect = this.getCanvas()?.getBoundingClientRect();
		if (!rect) return;
		
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		
		let newHovered = -1;
		this.buttons.forEach((btn, index) => {
			if (x >= btn.x && x <= btn.x + btn.width &&
				y >= btn.y && y <= btn.y + btn.height) {
				newHovered = index;
			}
		});
		
		if (newHovered !== this.hoveredIndex) {
			this.hoveredIndex = newHovered;
		}
	};

	private _onClick = (e: MouseEvent): void => {
		const rect = this.getCanvas()?.getBoundingClientRect();
		if (!rect) return;
		
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		
		this.buttons.forEach(btn => {
			if (x >= btn.x && x <= btn.x + btn.width &&
				y >= btn.y && y <= btn.y + btn.height) {
				btn.action();
			}
		});
	};
}

// 场景A - 空场景
class SceneA extends GScreen {
	enter(): void {
		super.enter();
		if (window.logger) {
			window.logger.log('SCENE_A', 'Scene A entered');
		}
	}

	render(_delta: number): void {
		if (!this.visible) return;
		
		const canvas = this.getCanvas();
		if (!canvas) return;
		
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.scale(this.dpr, this.dpr);
		
		// 背景
		ctx.fillStyle = '#0a0a1a';
		ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
		
		// 文字
		ctx.fillStyle = '#0ff';
		ctx.font = 'bold 48px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('场景 A', this.screenWidth / 2, this.screenHeight / 2);
		
		// 提示
		ctx.fillStyle = '#666';
		ctx.font = '16px sans-serif';
		ctx.fillText('点击返回主菜单', this.screenWidth / 2, this.screenHeight - 100);
	}

	handleBack(): boolean {
		if (this.screenManager) {
			this.screenManager.popScreen();
		}
		return true;
	}
}

// 场景B - 空场景
class SceneB extends GScreen {
	enter(): void {
		super.enter();
		if (window.logger) {
			window.logger.log('SCENE_B', 'Scene B entered');
		}
	}

	render(_delta: number): void {
		if (!this.visible) return;
		
		const canvas = this.getCanvas();
		if (!canvas) return;
		
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.scale(this.dpr, this.dpr);
		
		// 背景
		ctx.fillStyle = '#1a0a0a';
		ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
		
		// 文字
		ctx.fillStyle = '#f0f';
		ctx.font = 'bold 48px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('场景 B', this.screenWidth / 2, this.screenHeight / 2);
		
		// 提示
		ctx.fillStyle = '#666';
		ctx.font = '16px sans-serif';
		ctx.fillText('点击返回主菜单', this.screenWidth / 2, this.screenHeight - 100);
	}

	handleBack(): boolean {
		if (this.screenManager) {
			this.screenManager.popScreen();
		}
		return true;
	}
}

// 导出到全局
window.MenuScreen = MenuScreen;
window.SceneA = SceneA;
window.SceneB = SceneB;
