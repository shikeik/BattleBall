/**
 * UI 层级管理系统
 * 集中管理所有UI元素的z-index，避免冲突
 * 
 * 使用规范：
 * 1. 禁止直接写死 z-index 数值
 * 2. 使用 UILayers.XXX 常量
 * 3. 需要微调时使用 getAbove/getBelow
 */

const UILayers = {
	// ========== 基础层级定义 ==========
	
	/** 游戏画布 */
	GAME: 0,
	
	/** 游戏世界UI - 准星、指示器 */
	WORLD_UI: 1000,
	
	/** 游戏HUD - 分数、护盾、波次 */
	HUD: 2000,
	
	/** 武器系统UI - 能量条、武器槽位、效果 */
	WEAPON: 3000,
	
	/** 交互控件 - 摇杆、按钮 */
	CONTROLS: 4000,
	
	/** 弹窗/面板 - 设置、难度选择 */
	PANEL: 5000,
	
	/** 开始界面 */
	START_SCREEN: 8000,
	
	/** 飞船预览器（在开始界面之上） */
	SHIP_VIEWER: 8500,
	
	/** 游戏结束界面（最上层） */
	GAME_OVER: 9000,
	
	/** 调试工具 - 日志、性能监控 */
	DEBUG: 10000,
	
	/** 顶部工具栏 */
	TOOLBAR: 10001,
	
	// ========== 辅助方法 ==========
	
	/**
	 * 获取指定层级之上的层级
	 * @param {number} baseLayer - 基础层级
	 * @param {number} offset - 偏移量（默认1）
	 * @returns {number} 计算后的层级
	 */
	getAbove(baseLayer, offset = 1) {
		return baseLayer + offset;
	},
	
	/**
	 * 获取指定层级之下的层级
	 * @param {number} baseLayer - 基础层级
	 * @param {number} offset - 偏移量（默认1）
	 * @returns {number} 计算后的层级
	 */
	getBelow(baseLayer, offset = 1) {
		return baseLayer - offset;
	},
	
	/**
	 * 应用层级到DOM元素
	 * @param {HTMLElement} element - 目标元素
	 * @param {number} layer - 层级值
	 */
	apply(element, layer) {
		if (element && element.style) {
			element.style.zIndex = layer.toString();
		}
	},
	
	/**
	 * 批量应用CSS变量到根元素
	 * 在初始化时调用一次
	 */
	initCSSVariables() {
		const root = document.documentElement;
		root.style.setProperty('--layer-game', this.GAME);
		root.style.setProperty('--layer-world-ui', this.WORLD_UI);
		root.style.setProperty('--layer-hud', this.HUD);
		root.style.setProperty('--layer-weapon', this.WEAPON);
		root.style.setProperty('--layer-controls', this.CONTROLS);
		root.style.setProperty('--layer-panel', this.PANEL);
		root.style.setProperty('--layer-start-screen', this.START_SCREEN);
		root.style.setProperty('--layer-ship-viewer', this.SHIP_VIEWER);
		root.style.setProperty('--layer-game-over', this.GAME_OVER);
		root.style.setProperty('--layer-debug', this.DEBUG);
		root.style.setProperty('--layer-toolbar', this.TOOLBAR);
	},
	
	/**
	 * 获取层级的文字描述（用于调试）
	 * @param {number} layer - 层级值
	 * @returns {string} 层级名称
	 */
	getName(layer) {
		const names = {
			[this.GAME]: 'GAME',
			[this.WORLD_UI]: 'WORLD_UI',
			[this.HUD]: 'HUD',
			[this.WEAPON]: 'WEAPON',
			[this.CONTROLS]: 'CONTROLS',
			[this.PANEL]: 'PANEL',
			[this.START_SCREEN]: 'START_SCREEN',
			[this.SHIP_VIEWER]: 'SHIP_VIEWER',
			[this.GAME_OVER]: 'GAME_OVER',
			[this.DEBUG]: 'DEBUG',
			[this.TOOLBAR]: 'TOOLBAR'
		};
		return names[layer] || 'UNKNOWN';
	},
	
	/**
	 * 打印当前所有层级的信息（调试用）
	 */
	debug() {
		console.log('=== UI Layers ===');
		console.log(`GAME:      ${this.GAME}`);
		console.log(`WORLD_UI:  ${this.WORLD_UI}`);
		console.log(`HUD:       ${this.HUD}`);
		console.log(`WEAPON:    ${this.WEAPON}`);
		console.log(`CONTROLS:  ${this.CONTROLS}`);
		console.log(`PANEL:     ${this.PANEL}`);
		console.log(`START_SCREEN: ${this.START_SCREEN}`);
		console.log(`SHIP_VIEWER:  ${this.SHIP_VIEWER}`);
		console.log(`GAME_OVER:    ${this.GAME_OVER}`);
		console.log(`DEBUG:     ${this.DEBUG}`);
		console.log(`TOOLBAR:   ${this.TOOLBAR}`);
	}
};

// 导出
(window as any).UILayers = UILayers;

// 自动初始化CSS变量
document.addEventListener('DOMContentLoaded', () => {
	UILayers.initCSSVariables();
});

if ((window as any).logger) (window as any).logger.log('module', 'ui-layers loaded');
