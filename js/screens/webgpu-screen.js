/**
 * WebGPUScreen - WebGPU 演示界面
 */
class WebGPUScreen extends Screen {
	init() {
		this.canvas = document.getElementById('gameCanvas');
		this.webgpuDemo = null;
		this.initializing = false;
		this.error = null;
	}

	enter() {
		super.enter();
		this._initWebGPU();
	}

	exit() {
		super.exit();
		if (this.webgpuDemo) {
			this.webgpuDemo.stop();
		}
	}

	async _initWebGPU() {
		if (this.initializing || this.webgpuDemo) return;
		this.initializing = true;

		try {
			if (!window.WebGPUDemo) {
				throw new Error('WebGPUDemo not loaded');
			}

			this.webgpuDemo = new WebGPUDemo(this.canvas);
			await this.webgpuDemo.init();
			this.webgpuDemo.start();

			if (window.logger) logger.log('WEBGPU_SCREEN', 'WebGPU demo started');
		} catch (e) {
			this.error = e.message;
			if (window.logger) logger.log('WEBGPU_SCREEN', 'Failed to init', { error: e.message });
		} finally {
			this.initializing = false;
		}
	}

	render(delta) {
		// WebGPU 演示自己渲染到 canvas，这里只绘制 UI 覆盖层
		if (this.error) {
			this._renderError();
		} else if (this.initializing) {
			this._renderLoading();
		} else {
			this._renderUI();
		}
	}

	_renderError() {
		const ctx = this.canvas.getContext('2d');
		if (!ctx) return;

		const w = this.canvas.width;
		const h = this.canvas.height;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
		ctx.fillRect(0, 0, w, h);

		ctx.fillStyle = '#ff4444';
		ctx.font = '24px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('WebGPU 初始化失败', w / 2, h / 2 - 20);

		ctx.fillStyle = '#aaa';
		ctx.font = '14px sans-serif';
		ctx.fillText(this.error, w / 2, h / 2 + 20);

		ctx.fillStyle = '#666';
		ctx.fillText('点击返回', w / 2, h - 50);
	}

	_renderLoading() {
		const ctx = this.canvas.getContext('2d');
		if (!ctx) return;

		const w = this.canvas.width;
		const h = this.canvas.height;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
		ctx.fillRect(0, 0, w, h);

		ctx.fillStyle = '#4a9eff';
		ctx.font = '24px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('初始化 WebGPU...', w / 2, h / 2);
	}

	_renderUI() {
		const ctx = this.canvas.getContext('2d');
		if (!ctx) return;

		const w = this.canvas.width;

		// 顶部标题栏
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, 0, w, 40);

		ctx.fillStyle = '#fff';
		ctx.font = '16px sans-serif';
		ctx.textAlign = 'left';
		ctx.fillText('WebGPU 粒子演示', 20, 25);

		ctx.textAlign = 'right';
		ctx.fillStyle = '#aaa';
		ctx.fillText('返回键返回主菜单', w - 20, 25);
	}

	handleBack() {
		this.screenManager.popScreen();
		return true;
	}
}

window.WebGPUScreen = WebGPUScreen;
