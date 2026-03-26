"use strict";
/**
 * 性能监控器 - 简化版
 * 实时显示 FPS
 */
class PerfMonitor {
    constructor() {
        this.enabled = false;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.panel = null;
        this.createPanel();
        this.bindToggle();
    }
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'perf-panel';
        this.panel.style.cssText = `
			position: fixed;
			top: 50px;
			right: 10px;
			width: 200px;
			background: rgba(0, 0, 0, 0.85);
			border: 1px solid rgba(0, 255, 255, 0.3);
			border-radius: 4px;
			padding: 10px;
			color: #0ff;
			font-family: monospace;
			font-size: 12px;
			z-index: ${UILayers.DEBUG};
			display: none;
		`;
        this.panel.innerHTML = `
			<div style="text-align: center; margin-bottom: 10px; border-bottom: 1px solid rgba(0,255,255,0.3); padding-bottom: 5px;">
				⚡ Performance
			</div>
			<div id="perf-fps">FPS: 60</div>
			<div id="perf-memory" style="margin-top: 5px;">Memory: --</div>
		`;
        document.body.appendChild(this.panel);
        // 开始更新循环
        this.updateLoop();
    }
    bindToggle() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                this.toggle();
            }
        });
    }
    updateLoop() {
        if (!this.enabled) {
            requestAnimationFrame(() => this.updateLoop());
            return;
        }
        this.frameCount++;
        const now = performance.now();
        const delta = now - this.lastTime;
        // 每秒更新一次 FPS
        if (delta >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / delta);
            this.frameCount = 0;
            this.lastTime = now;
            const fpsEl = document.getElementById('perf-fps');
            if (fpsEl)
                fpsEl.textContent = `FPS: ${this.fps}`;
            const memEl = document.getElementById('perf-memory');
            if (memEl && performance.memory) {
                const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
                const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(1);
                memEl.textContent = `Memory: ${used}/${total} MB`;
            }
        }
        requestAnimationFrame(() => this.updateLoop());
    }
    toggle() {
        this.enabled = !this.enabled;
        if (this.panel) {
            this.panel.style.display = this.enabled ? 'block' : 'none';
        }
        if (window.logger)
            logger.log('PERF', this.enabled ? '性能面板已开启' : '性能面板已关闭');
    }
}
// 导出
window.PerfMonitor = PerfMonitor;
// 创建全局实例供 toolbar 使用
window.tempPerfMonitor = new PerfMonitor();
//# sourceMappingURL=perf-monitor.js.map