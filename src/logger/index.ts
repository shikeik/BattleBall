/**
 * 日志系统入口
 * 组合 LoggerCore + LoggerUI
 */

class Logger {
	core: any;
	ui: any;

	constructor() {
		// 核心（数据）
		this.core = new LoggerCore(LOGGER_CONFIG);
		
		// UI（视图）
		this.ui = new LoggerUI(this.core);
		
		// 全局错误捕获
		window.onerror = (msg, url, line) => {
			this.core.log('ERROR', String(msg), { line });
			return false;
		};
	}
	
	// 代理到 core
	log(tag, msg, data) {
		return this.core.log(tag, msg, data);
	}
	
	// 代理方法
	clear() { this.core.clear(); }
	show() { this.ui.show(); }
	hide() { this.ui.hide(); }
	toggle() { this.ui.toggle(); }
	
	// 动态添加标签（运行时配置）
	addTag(key, config) {
		LOGGER_CONFIG.tags[key] = config;
		this.ui.renderFilters();
	}
	
	// 移除标签
	removeTag(key) {
		delete LOGGER_CONFIG.tags[key];
		this.ui.renderFilters();
	}
}

// 初始化
window.logger = new Logger();

// 模块加载检测
if (window.logger) window.logger.core.log('module', 'logger.js loaded');
