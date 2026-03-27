/**
 * 日志 UI - 纯 DOM 操作，依赖 LoggerCore
 */

class LoggerUI {
	core: any;
	visible: boolean;
	autoScroll: boolean;
	panel: HTMLDivElement | null;
	tab: HTMLDivElement | null;
	logArea: HTMLDivElement | null;
	filterPanel: HTMLDivElement | null;

	constructor(core: any) {
		this.core = core;
		this.visible = false;
		this.autoScroll = true;
		this.panel = null;
		this.tab = null;
		this.logArea = null;
		this.filterPanel = null;
		this.init();
	}
	
	init() {
		const create = () => {
			this.createPanel();
			this.bindEvents();
			this.bindCoreEvents();
			
			// 放入main-layout
			const mainLayout = document.getElementById('main-layout');
			if (mainLayout) {
				mainLayout.appendChild(this.panel);
			} else {
				document.body.appendChild(this.panel);
			}
		};
		
		if (document.body) create();
		else window.addEventListener('DOMContentLoaded', create);
	}
	
	// Tab 由 toolbar.js 创建和管理，这里只保留更新状态的方法
	
	// 注意：toggleSettings, createSettingsPanel, toggleFullscreen, goBack 已移到 toolbar.js
	
	createPanel() {
		const cfg = this.core.config.panel;
		
		this.panel = document.createElement('div');
		this.panel.className = 'scrollable';
		this.panel.style.cssText = `
			position: fixed;
			top: -${cfg.maxHeight + 30}px;
			left: 10px;
			right: 10px;
			max-height: ${cfg.maxHeight}px;
			margin-top: 30px;
			background: rgba(0, 10, 20, 0.98);
			border: 1px solid #0f0;
			border-radius: 0 0 8px 8px;
			font-family: monospace;
			font-size: 10px;
			color: #0f0;
			z-index: ${UILayers.DEBUG};
			display: flex;
			flex-direction: column;
			transition: top 0.3s ease;
			box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
			touch-action: pan-y;
			-webkit-overflow-scrolling: touch;
			pointer-events: auto;
		`;
		
		// 头部
		const header = document.createElement('div');
		header.style.cssText = `
			padding: 8px 10px;
			background: rgba(0, 255, 0, 0.1);
			border-bottom: 1px solid #0f0;
			display: flex;
			justify-content: space-between;
			align-items: center;
		`;
		header.innerHTML = `
			<span style="font-size:12px; font-weight:bold;">🎮 Console</span>
			<span>
				<span id="log-auto-btn" style="margin-right:10px; cursor:pointer; color:#0f0;">AUTO:ON</span>
				<span id="log-save-btn" style="margin-right:10px; cursor:pointer; color:#0ff;">保存</span>
				<span id="log-filter-btn" style="margin-right:10px; cursor:pointer; color:#0ff;">筛选 ▼</span>
				<span id="log-clear-btn" style="margin-right:10px; cursor:pointer;">清空</span>
				<span id="log-close-btn" style="cursor:pointer; font-size:16px;">×</span>
			</span>
		`;
		this.panel.appendChild(header);
		
		// 筛选面板
		this.filterPanel = document.createElement('div');
		this.filterPanel.className = 'scrollable';
		this.filterPanel.style.cssText = `
			max-height: ${cfg.filterHeight}px;
			height: ${cfg.filterHeight}px;
			overflow-y: auto;
			overflow-x: hidden;
			border-bottom: 1px solid #004400;
			display: none;
			padding: 8px;
			touch-action: pan-y;
			-webkit-overflow-scrolling: touch;
			position: relative;
		`;
		this.renderFilters();
		this.panel.appendChild(this.filterPanel);
		
		// 日志区域
		this.logArea = document.createElement('div');
		this.logArea.className = 'scrollable';
		this.logArea.style.cssText = `
			flex: 1;
			overflow-y: auto;
			padding: 8px;
			max-height: ${cfg.maxHeight - cfg.filterHeight - 40}px;
			touch-action: pan-y;
			-webkit-overflow-scrolling: touch;
		`;
		this.panel.appendChild(this.logArea);
	}
	
	renderFilters() {
		const tags = this.core.getAllTags();
		
		this.filterPanel.innerHTML = '<div style="color:#0ff; margin-bottom:3px; font-size:9px;">勾选要显示的 tag:</div>';
		
		// 只显示主 tag，简化筛选
		Object.entries(tags).forEach(([key, cfg]) => {
			const div = document.createElement('div');
			div.style.cssText = 'padding: 2px 5px; display:flex; align-items:center; height:18px;';
			const checked = this.core.activeTags.includes(key) ? 'checked' : '';
			const checkStyle = 'width:14px;height:14px;margin-right:6px;';
			
			div.innerHTML = `
				<input type="checkbox" data-tag="${key}" ${checked} style="${checkStyle}">
				<span style="color:${(cfg as any).color || '#0f0'}; font-weight:bold; font-size:11px;">${key}</span>
			`;
			
			// checkbox 变化时触发筛选
			const cb = div.querySelector('input');
			cb.addEventListener('change', () => {
				this.core.toggleTag(key, cb.checked);
			});
			
			this.filterPanel.appendChild(div);
		});
	}
	
	bindEvents() {
		this.panel.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			if (target.id === 'log-auto-btn') {
				this.autoScroll = !this.autoScroll;
				target.textContent = this.autoScroll ? 'AUTO:ON' : 'AUTO:OFF';
				target.style.color = this.autoScroll ? '#0f0' : '#666';
			}
			if (target.id === 'log-save-btn') {
				this.saveLogs();
			}
			if (target.id === 'log-filter-btn') {
				const isHidden = this.filterPanel.style.display === 'none';
				this.filterPanel.style.display = isHidden ? 'block' : 'none';
				target.textContent = isHidden ? '筛选 ▲' : '筛选 ▼';
				if (isHidden) {
					this.filterPanel.offsetHeight;
				}
			}
			if (target.id === 'log-clear-btn') {
				this.core.clear();
			}
			if (target.id === 'log-close-btn') {
				this.hide();
			}
		});
	}
	
	bindCoreEvents() {
		this.core.on('newLog', (log) => {
			if (this.core.isTagActive(log.tag)) {
				this.displayLog(log);
			}
		});
		
		this.core.on('cleared', () => {
			if (this.logArea) this.logArea.innerHTML = '';
		});
		
		this.core.on('tagsChanged', () => {
			this.refreshLogs();
		});
	}
	
	displayLog(log) {
		if (!this.logArea) return;
		const div = document.createElement('div');
		div.style.cssText = 'margin: 3px 0; word-break: break-all; border-bottom: 1px solid #001100; padding-bottom: 2px;';
		
		// 解析 tag 获取颜色
		const parentTag = log.tag.split('.')[0];
		const cfg = this.core.getTagConfig(parentTag);
		const color = cfg.color || '#0f0';
		
		// 带颜色的 HTML - 整行使用 tag 颜色
		div.innerHTML = `
			<span style="color:${color}">[${log.time}]</span> 
			<span style="color:${color};opacity:0.7">[${log.tag}]</span> 
			<span style="color:${color};opacity:0.9">${log.msg}</span>
		`;
		if (log.data) {
			div.innerHTML += ` <span style="color:#666">${JSON.stringify(log.data)}</span>`;
		}
		
		this.logArea.appendChild(div);
		if (this.autoScroll) {
			this.logArea.scrollTop = this.logArea.scrollHeight;
		}
	}
	
	refreshLogs() {
		if (!this.logArea) return;
		this.logArea.innerHTML = '';
		this.core.getFilteredLogs().forEach(log => this.displayLog(log));
	}
	
	saveLogs() {
		const text = this.core.getAllLogs();
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `game-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		this.core.log('logger', 'Logs saved to file');
	}
	
	toggle() {
		if (this.visible) this.hide();
		else this.show();
	}
	
	show() {
		this.visible = true;
		this.panel.style.top = '0';
		// 通知 toolbar 更新按钮状态
		if (window.toolbar) (window as any).toolbar.updateLogButton(true);
	}
	
	hide() {
		this.visible = false;
		this.panel.style.top = `-${this.core.config.panel.maxHeight + 50}px`;
		// 通知 toolbar 更新按钮状态
		if (window.toolbar) (window as any).toolbar.updateLogButton(false);
	}
}

// 导出
(window as any).LoggerUI = LoggerUI;
