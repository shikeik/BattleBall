// @ts-nocheck
/**
 * 日志系统配置
 * 可自定义标签结构，无需修改代码
 */

// 默认标签配置
const DEFAULT_LOG_TAGS = {
	ALL: {
		label: '全部',
		subs: ['default'],
		color: '#fff'
	},
	ERROR: { 
		label: '❌ 错误',
		subs: ['default'],
		color: '#f00'
	},
	TMP: {
		label: '🐛 调试',
		subs: ['default'],
		color: '#888'
	},
	game: { 
		label: '🎮 游戏',
		subs: ['init', 'loop', 'state', 'default'],
		color: '#0f0'
	},
	render: { 
		label: '🎨 渲染',
		subs: ['setup', 'camera', 'lights', 'objects', 'default'],
		color: '#0ff'
	},
	input: { 
		label: '🎮 输入',
		subs: ['keyboard', 'touch', 'default'],
		color: '#ff0'
	},
	audio: { 
		label: '🔊 音频',
		subs: ['init', 'play', 'default'],
		color: '#f0f'
	},
	perf: { 
		label: '⚡ 性能',
		subs: ['fps', 'memory', 'default'],
		color: '#fa0'
	},
	module: { 
		label: '📦 模块',
		subs: ['default'],
		color: '#88f'
	},
	// 新增主 Tag
	AUDIO: {
		label: '🔊 音频管理',
		subs: ['default'],
		color: '#f0f'
	},
	DIFFICULTY: {
		label: '📊 难度',
		subs: ['default'],
		color: '#f80'
	},
	GAME: {
		label: '🎯 游戏事件',
		subs: ['default'],
		color: '#0f0'
	},
	INPUT: {
		label: '⌨️ 输入事件',
		subs: ['default'],
		color: '#ff0'
	},
	PERF: {
		label: '⚡ 性能报告',
		subs: ['default'],
		color: '#fa0'
	},
	UI: {
		label: '🖱️ UI事件',
		subs: ['default'],
		color: '#0af'
	},
	system: {
		label: '🔧 系统',
		subs: ['default'],
		color: '#888'
	}
};

// 颜色调色板（16色，高对比）
const COLOR_PALETTE = [
	'#0f0', '#0ff', '#ff0', '#f0f', '#fa0', '#88f', '#f00',
	'#0af', '#0f8', '#f80', '#f08', '#80f', '#8f0', '#08f', '#888', '#fff'
];

// 为 tag 分配颜色（简单哈希，保证不同）
function assignColor(tagName, index) {
	// 预定义的颜色
	const predefined = {
		game: '#0f0', render: '#0ff', input: '#ff0', audio: '#f0f',
		perf: '#fa0', module: '#88f', ERROR: '#f00',
		AUDIO: '#f0f', DIFFICULTY: '#f80', GAME: '#0f0', INPUT: '#ff0',
		PERF: '#fa0', UI: '#0af', system: '#888'
	};
	if (predefined[tagName]) return predefined[tagName];
	
	// 其他 tag 按索引分配
	return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

// 日志配置
const LOGGER_CONFIG = {
	// 最大日志条数（无限制）
	maxLogs: Infinity,
	
	// 面板样式
	panel: {
		maxHeight: 350,
		filterHeight: 120
	},
	
	// 标签配置（可外部覆盖）
	tags: DEFAULT_LOG_TAGS,
	
	// 存储键名
	storageKey: 'sf-log-tags',
	
	// 颜色分配函数
	assignColor
};

// 支持外部配置覆盖
(window as any).setLoggerConfig = (config: any) => {
	Object.assign(LOGGER_CONFIG, config);
	if (config.tags) {
		LOGGER_CONFIG.tags = { ...DEFAULT_LOG_TAGS, ...config.tags };
	}
};

// 运行时手动注册的顶级 tag（集中管理）
const RUNTIME_TAGS = new Set([
	'system',   // 系统信息
	'AUDIO',    // 音频管理
	'DIFFICULTY', // 难度
	'GAME',     // 游戏事件
	'INPUT',    // 输入事件
	'PERF',     // 性能报告
	'UI',       // UI事件
]);

(window as any).getRuntimeTags = () => Array.from(RUNTIME_TAGS);

// 导出
(window as any).LOGGER_CONFIG = LOGGER_CONFIG;
(window as any).DEFAULT_LOG_TAGS = DEFAULT_LOG_TAGS;
