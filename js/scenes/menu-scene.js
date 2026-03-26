/**
 * MenuScene - 主菜单场景
 * 原版用法：填充 screenMapping，null 作为分隔线
 */
class MenuScene extends SelectionScene {
	initScreenMapping(map) {
		console.log('initScreenMapping:', { GameScene, WebGPUScene, SettingsScene });
		map.set('开始游戏', GameScene);
		map.set('WebGPU 演示', WebGPUScene);
		map.set('其他', null); // 分隔线
		map.set('设置', SettingsScene);
	}
}

// 占位符游戏场景，后续实现
class GameScene extends Scene {
	render(delta) {
		if (!this.canvas) return;
		const ctx = this.canvas.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = '#0a0a1a';
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		ctx.fillStyle = '#fff';
		ctx.font = '24px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('游戏场景（占位符）', this.canvas.width / 2, this.canvas.height / 2);

		ctx.font = '14px sans-serif';
		ctx.fillStyle = '#666';
		ctx.fillText('ESC 返回主菜单', this.canvas.width / 2, this.canvas.height - 30);
	}

	handleBack() {
		this.sceneManager.replaceScene(MenuScene);
		return true;
	}
}

window.MenuScene = MenuScene;
window.GameScene = GameScene;
