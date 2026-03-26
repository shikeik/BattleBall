/**
 * MenuScene - 主菜单场景
 * 使用 SelectionScene 基类快速构建
 */
class MenuScene extends SelectionScene {
	initSelectionItems() {
		this.title = 'BATTLE BALL';

		this.addItem('开始游戏', () => {
			this.sceneManager.playTransition(() => {
				// TODO: 跳转到游戏场景
				if (window.logger) logger.log('MENU', 'Start game (placeholder)');
			});
		});

		this.addItem('WebGPU 演示', () => {
			this.sceneManager.playTransition(() => {
				this.goScene(WebGPUScene);
			});
		});

		this.addItem('设置', () => {
			this.goScene(SettingsScene);
		});
	}

	getFooterHint() {
		return '选择模式开始 | ESC 返回';
	}

	handleBack() {
		// 主菜单不处理返回，让系统处理（退出）
		return false;
	}
}

window.MenuScene = MenuScene;
