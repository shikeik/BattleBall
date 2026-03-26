/**
 * MenuScreen - 主菜单界面
 * 原版用法：填充 screenMapping，null 作为分隔线
 */
class MenuScreen extends SelectionScreen {
	initScreenMapping(map) {
		if (window.logger) logger.log('TMP', 'initScreenMapping:', { GameScreen, WebGPUScreen, SettingsScreen });
		map.set('开始游戏', GameScreen);
		map.set('WebGPU 演示', WebGPUScreen);
		map.set('其他', null); // 分隔线
		map.set('设置', SettingsScreen);
	}
}

// 占位符游戏界面，后续实现
class GameScreen extends Screen {
	render(delta) {
		if (!this.canvas) return;
		const ctx = this.canvas.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = '#0a0a1a';
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		ctx.fillStyle = '#fff';
		ctx.font = '24px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('游戏界面（占位符）', this.canvas.width / 2, this.canvas.height / 2);

		ctx.font = '14px sans-serif';
		ctx.fillStyle = '#666';
		ctx.fillText('ESC 返回主菜单', this.canvas.width / 2, this.canvas.height - 30);
	}

	handleBack() {
		this.screenManager.replaceScreen(MenuScreen);
		return true;
	}
}

window.MenuScreen = MenuScreen;
window.GameScreen = GameScreen;
