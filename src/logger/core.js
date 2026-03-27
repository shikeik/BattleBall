/**
 * 日志核心 - 纯数据逻辑，无 DOM 操作
 */

class LoggerCore {
	constructor(config = LOGGER_CONFIG) {
		this.config = config;
		this.logs = [];           // 所有日志（无限制）
		this.activeTags = this.loadActiveTags();
		this.listeners = [];
	}
	
	// 加载激活的标签
	loadActiveTags() {
		// 默认勾选 ALL 和 ERROR
		return ['ALL', 'ERROR'];
	}
	
	// 检查标签是否激活
	// 规则：ALL勾选时显示所有；否则看具体tag
	isTagActive(fullTag) {
		// ALL 勾选时，显示所有日志
		if (this.activeTags.includes('ALL')) return true;
		
		// 否则看父tag是否勾选
		const parent = fullTag.split('.')[0];
		return this.activeTags.includes(parent);
	}
	
	// 切换标签
	toggleTag(tag, checked) {
		if (checked) {
			if (!this.activeTags.includes(tag)) {
				this.activeTags.push(tag);
			}
		} else {
			this.activeTags = this.activeTags.filter(t => t !== tag);
		}
		this.saveTags();
		this.notify('tagsChanged', this.activeTags);
	}
	
	// 保存到 localStorage
	saveTags() {
		try {
			localStorage.setItem(this.config.storageKey, JSON.stringify(this.activeTags));
		} catch (e) {}
	}
	
	// 记录日志
	log(tag, msg, data) {
		const fullTag = tag.includes('.') ? tag : `${tag}.default`;
		
		const time = new Date().toLocaleTimeString('zh-CN', { 
			hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' 
		});
		
		const dataStr = data ? ' ' + JSON.stringify(data) : '';
		const line = `[${time}] [${fullTag}] ${msg}${dataStr}`;
		
		const logEntry = { time, tag: fullTag, msg, data, line };
		this.logs.push(logEntry);
		
		// 通知监听器
		this.notify('newLog', logEntry);
		
		// 控制台输出
		console.log(line);
		
		return logEntry;
	}
	
	// 获取筛选后的日志
	getFilteredLogs() {
		return this.logs.filter(log => this.isTagActive(log.tag));
	}
	
	// 清空日志
	clear() {
		this.logs = [];
		this.notify('cleared');
	}
	
	// 获取所有日志（用于保存）
	getAllLogs() {
		return this.logs.map(l => l.line).join('\n');
	}
	
	// 订阅事件
	on(event, callback) {
		this.listeners.push({ event, callback });
	}
	
	// 通知监听器
	notify(event, data) {
		this.listeners
			.filter(l => l.event === event)
			.forEach(l => l.callback(data));
	}
	
	// 获取标签配置（自动分配颜色）
	getTagConfig(tag) {
		const cfg = this.config.tags[tag];
		if (cfg) return cfg;
		
		// 动态 tag，分配颜色
		const allTags = Object.keys(this.config.tags);
		const index = allTags.length;
		const color = this.config.assignColor ? 
			this.config.assignColor(tag, index) : '#888';
		
		return { label: tag, subs: ['default'], color };
	}
	
	// 获取所有标签（预定义 + 手动注册）
	getAllTags() {
		const allTags = { ...this.config.tags };
		
		// 添加手动注册的运行时 tag
		if (typeof window !== 'undefined' && window.getRuntimeTags) {
			window.getRuntimeTags().forEach(tag => {
				if (!allTags[tag]) {
					allTags[tag] = this.getTagConfig(tag);
				}
			});
		}
		
		return allTags;
	}
}

// 导出
window.LoggerCore = LoggerCore;
