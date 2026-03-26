"use strict";
/**
 * 加载场景管理器
 * 负责所有系统初始化，显示加载进度，完成后自动转场
 */
class LoadingScreen {
    constructor() {
        this.container = null;
        this.progressBar = null;
        this.progressText = null;
        this.statusText = null;
        this.onComplete = null;
        this.initTasks = [];
        this.currentTask = 0;
    }
    /**
     * 创建加载界面
     */
    create() {
        this.container = document.createElement('div');
        this.container.id = 'loading-screen';
        this.container.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: radial-gradient(ellipse at center, rgba(0,20,40,0.98) 0%, rgba(0,0,0,0.99) 100%);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			z-index: 99999;
			font-family: 'Orbitron', monospace;
			color: #0ff;
		`;
        this.container.innerHTML = `
			<h1 style="font-size: 36px; margin-bottom: 10px; text-shadow: 0 0 20px #0ff;">🚀 STAR FIGHTER</h1>
			<div style="font-size: 14px; color: #888; margin-bottom: 60px;">SYSTEM INITIALIZING...</div>
			
			<div style="width: 300px; height: 4px; background: rgba(0,255,255,0.2); border-radius: 2px; overflow: hidden; margin-bottom: 20px;">
				<div id="loading-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #0ff, #00f); box-shadow: 0 0 10px #0ff; transition: width 0.3s ease;"></div>
			</div>
			
			<div id="loading-percent" style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">0%</div>
			<div id="loading-status" style="font-size: 12px; color: #666;">Preparing...</div>
		`;
        document.body.appendChild(this.container);
        this.progressBar = document.getElementById('loading-progress');
        this.progressText = document.getElementById('loading-percent');
        this.statusText = document.getElementById('loading-status');
    }
    /**
     * 注册初始化任务
     * @param {string} name - 任务名称
     * @param {Function} task - 异步任务函数
     * @param {number} weight - 任务权重（占总进度的比例）
     */
    registerTask(name, task, weight = 1) {
        this.initTasks.push({ name, task, weight });
    }
    /**
     * 更新进度显示
     */
    updateProgress(percent, status) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percent}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = `${Math.round(percent)}%`;
        }
        if (this.statusText && status) {
            this.statusText.textContent = status;
        }
    }
    /**
     * 执行所有初始化任务
     */
    async start() {
        this.create();
        const startTime = Date.now();
        const minLoadTime = 1000; // 最少加载1秒
        const totalWeight = this.initTasks.reduce((sum, t) => sum + t.weight, 0);
        let completedWeight = 0;
        for (let i = 0; i < this.initTasks.length; i++) {
            const { name, task, weight } = this.initTasks[i];
            this.currentTask = i;
            this.updateProgress((completedWeight / totalWeight) * 100, `Loading: ${name}...`);
            try {
                await task();
            }
            catch (e) {
                console.error(`Failed to load: ${name}`, e);
                if (window.logger)
                    logger.log('LOADING', `Task failed: ${name}`, { error: e.message });
            }
            completedWeight += weight;
        }
        // 100%
        this.updateProgress(100, 'Complete!');
        // 确保至少显示2秒
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoadTime - elapsed);
        await new Promise(r => setTimeout(r, remaining));
        this.complete();
    }
    /**
     * 加载完成，转场到开始界面
     */
    complete() {
        // 显示UI层
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) {
            uiLayer.style.visibility = 'visible';
        }
        if (this.onComplete) {
            this.onComplete();
        }
        // 淡出动画
        if (this.container) {
            this.container.style.transition = 'opacity 0.5s ease';
            this.container.style.opacity = '0';
            setTimeout(() => {
                if (this.container && this.container.parentNode) {
                    this.container.parentNode.removeChild(this.container);
                }
            }, 500);
        }
    }
}
// 导出
window.LoadingScreen = LoadingScreen;
//# sourceMappingURL=loading-screen.js.map