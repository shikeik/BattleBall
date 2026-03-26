/**
 * 脚本加载器
 * 动态加载 JS 文件，支持进度回调
 */

class ScriptLoader {
	constructor() {
		this.cacheBuster = window.CACHE_BUSTER || Date.now();
	}
	
	/**
	 * 加载单个脚本
	 * @param {string} src - 脚本路径
	 * @param {boolean} useCache - 是否使用缓存（CDN文件用缓存）
	 * @returns {Promise}
	 */
	loadOne(src, useCache = false) {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			// CDN文件(http开头)使用缓存，本地文件加缓存戳
			script.src = useCache || src.startsWith('http') ? src : src + '?t=' + this.cacheBuster;
			script.async = false; // 保持顺序
			
			// CDN脚本添加crossOrigin属性，避免"Script error."
			if (src.startsWith('http')) {
				script.crossOrigin = 'anonymous';
			}
			
			script.onload = () => {
				if (window.logger) logger.log('LOADER', 'Script loaded', { src });
				resolve(src);
			};
			
			script.onerror = () => {
				console.error('Failed to load:', src);
				if (window.logger) logger.log('LOADER', 'Script failed', { src });
				reject(new Error(`Failed to load ${src}`));
			};
			
			document.head.appendChild(script);
		});
	}
	
	/**
	 * 批量加载脚本，带进度回调
	 * @param {Array} scripts - 脚本配置数组 [{name, src, weight, useCache}]
	 * @param {Function} onProgress - 进度回调 (percent, status)
	 * @returns {Promise}
	 */
	async loadBatch(scripts, onProgress) {
		const totalWeight = scripts.reduce((sum, s) => sum + (s.weight || 1), 0);
		let completedWeight = 0;
		
		for (const { name, src, weight = 1, useCache } of scripts) {
			onProgress(
				(completedWeight / totalWeight) * 100,
				`Loading: ${name}...`
			);
			
			await this.loadOne(src, useCache);
			completedWeight += weight;
		}
		
		onProgress(100, 'Scripts loaded');
	}
}

// 脚本加载配置 - 只包含基础框架
const SCRIPT_GROUPS = {
	// UI层级系统
	ui: [
		{ name: 'UI Layers', src: 'js/ui/layers.js', weight: 1 },
	],
	
	// 日志系统
	logger: [
		{ name: 'Logger Config', src: 'js/logger/config.js', weight: 1 },
		{ name: 'Logger Core', src: 'js/logger/core.js', weight: 1 },
		{ name: 'Logger UI', src: 'js/logger/ui.js', weight: 1 },
		{ name: 'Logger Index', src: 'js/logger/index.js', weight: 1 },
	],
	
	// 工具栏
	toolbar: [
		{ name: 'Perf Monitor', src: 'js/perf-monitor.js', weight: 1 },
		{ name: 'Toolbar', src: 'js/toolbar.js', weight: 1 },
	],
	
	// WebGPU 演示
	webgpuDemo: [
		{ name: 'WebGPU Demo', src: 'js/webgpu-demo/webgpu-demo.js', weight: 1 },
	],
	
	// 场景管理系统
	scene: [
		{ name: 'Scene Base', src: 'js/scene/scene.js', weight: 1 },
		{ name: 'Scene Manager', src: 'js/scene/scene-manager.js', weight: 1 },
		{ name: 'Selection Scene', src: 'js/scene/selection-scene.js', weight: 1 },
	],
	
	// 游戏场景（注意加载顺序，被依赖的先加载）
	scenes: [
		{ name: 'WebGPU Scene', src: 'js/scenes/webgpu-scene.js', weight: 1 },
		{ name: 'Settings Scene', src: 'js/scenes/settings-scene.js', weight: 1 },
		{ name: 'Menu Scene', src: 'js/scenes/menu-scene.js', weight: 1 },
	],
};

// 导出
window.ScriptLoader = ScriptLoader;
window.SCRIPT_GROUPS = SCRIPT_GROUPS;
