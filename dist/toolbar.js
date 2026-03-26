"use strict";
/**
 * 顶部工具栏 - 分页管理版
 * 支持多页工具菜单，横向滑动翻页
 */
class Toolbar {
    constructor() {
        this.currentPage = 0;
        this.totalPages = 2;
        this.buttonsPerPage = 8;
        this.allButtons = [];
        this.container = null;
        this.pageIndicator = null;
        this.touchStartX = 0;
        this.isDragging = false;
        this.dragOffset = 0;
        this.init();
    }
    init() {
        const create = () => {
            this.createContainer();
            this.createPageIndicator();
            this.registerDefaultButtons();
            this.fillEmptySlots();
            this.renderAllPages();
            this.bindEvents();
        };
        if (document.body)
            create();
        else
            window.addEventListener('DOMContentLoaded', create);
    }
    // 创建主容器 - 带背景线框
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toolbar-container';
        this.container.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 40px;
			z-index: ${UILayers.TOOLBAR};
			overflow: hidden;
			pointer-events: auto;
		`;
        // 按钮轨道（用于滑动）
        this.track = document.createElement('div');
        this.track.id = 'toolbar-track';
        this.track.style.cssText = `
			display: flex;
			width: ${this.totalPages * 100}%;
			height: 100%;
			transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		`;
        this.container.appendChild(this.track);
        document.body.appendChild(this.container);
    }
    // 创建页面指示器
    createPageIndicator() {
        this.pageIndicator = document.createElement('div');
        this.pageIndicator.id = 'toolbar-page-indicator';
        this.pageIndicator.style.cssText = `
			position: fixed;
			top: 42px;
			left: 50%;
			transform: translateX(-50%);
			display: flex;
			gap: 6px;
			z-index: ${UILayers.TOOLBAR};
			pointer-events: none;
		`;
        this.updatePageIndicator();
        document.body.appendChild(this.pageIndicator);
    }
    // 更新页面指示器
    updatePageIndicator() {
        this.pageIndicator.innerHTML = '';
        for (let i = 0; i < this.totalPages; i++) {
            const dot = document.createElement('div');
            dot.style.cssText = `
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background: ${i === this.currentPage ? '#0ff' : 'rgba(0,255,255,0.3)'};
				box-shadow: ${i === this.currentPage ? '0 0 6px #0ff' : 'none'};
				transition: all 0.3s;
			`;
            this.pageIndicator.appendChild(dot);
        }
    }
    // 注册默认按钮
    registerDefaultButtons() {
        // 第一页 - 核心功能
        this.registerButton({
            id: 'back',
            icon: '←',
            page: 0,
            onClick: () => this.goBack()
        });
        // 第2个按钮：全屏切换
        this.registerButton({
            id: 'fullscreen',
            icon: '⛶',
            page: 0,
            onClick: () => this.toggleFullscreen()
        });
        // 第3个按钮：转屏切换
        this.registerButton({
            id: 'rotate',
            icon: '🔄',
            page: 0,
            onClick: () => this.toggleOrientation()
        });
        this.registerButton({
            id: 'log',
            icon: '◇',
            page: 0,
            onClick: () => {
                if (window.logger && window.logger.toggle) {
                    window.logger.toggle();
                }
            }
        });
        this.registerButton({
            id: 'settings',
            icon: '⚙',
            page: 0,
            onClick: () => this.toggleSettings()
        });
        this.registerButton({
            id: 'perf',
            icon: '📊',
            page: 0,
            onClick: () => {
                if (window.game && window.game.perfMonitor) {
                    window.game.perfMonitor.toggle();
                }
                else if (window.tempPerfMonitor) {
                    window.tempPerfMonitor.toggle();
                }
            }
        });
        this.registerButton({
            id: 'debug',
            icon: '🐛',
            page: 0,
            onClick: () => this.toggleDebugPanel()
        });
    }
    // 填充空位到两页
    fillEmptySlots() {
        const totalSlots = this.totalPages * this.buttonsPerPage;
        let emptyIndex = 1;
        for (let i = 0; i < totalSlots; i++) {
            const page = Math.floor(i / this.buttonsPerPage);
            const indexInPage = i % this.buttonsPerPage;
            // 检查该位置是否已有按钮
            const existing = this.allButtons.find(b => b.page === page && b.indexInPage === indexInPage);
            if (!existing) {
                this.registerButton({
                    id: `empty-${page}-${indexInPage}`,
                    icon: '○',
                    page: page,
                    indexInPage: indexInPage,
                    onClick: () => {
                        if (window.logger)
                            logger.log('TOOLBAR', `空按钮 P${page}-${indexInPage} 被点击`);
                    }
                });
                emptyIndex++;
            }
        }
    }
    // 注册按钮（公开API）
    registerButton(config) {
        const button = {
            id: config.id,
            icon: config.icon || '○',
            page: config.page || 0,
            indexInPage: config.indexInPage !== undefined ? config.indexInPage : this.getNextSlotIndex(config.page),
            onClick: config.onClick || (() => { }),
            element: null
        };
        this.allButtons.push(button);
        return button;
    }
    // 获取下一可用槽位索引
    getNextSlotIndex(page) {
        const pageButtons = this.allButtons.filter(b => b.page === page);
        return pageButtons.length;
    }
    // 渲染所有页面（一次性渲染，通过transform滑动）
    renderAllPages() {
        this.track.innerHTML = '';
        for (let p = 0; p < this.totalPages; p++) {
            // 创建页容器
            const pageEl = document.createElement('div');
            pageEl.className = 'toolbar-page';
            pageEl.style.cssText = `
				display: flex;
				justify-content: space-evenly;
				align-items: flex-start;
				width: ${100 / this.totalPages}%;
				height: 100%;
				padding: 0 8px;
			`;
            // 获取该页按钮
            const pageButtons = this.allButtons
                .filter(b => b.page === p)
                .sort((a, b) => a.indexInPage - b.indexInPage);
            // 创建按钮元素
            pageButtons.forEach(button => {
                const el = this.createButtonElement(button);
                button.element = el;
                pageEl.appendChild(el);
            });
            this.track.appendChild(pageEl);
        }
        this.updateSlidePosition();
        this.updatePageIndicator();
    }
    // 创建按钮元素 - 书签样式，固定宽度
    createButtonElement(button) {
        const el = document.createElement('div');
        el.className = 'toolbar-btn';
        el.dataset.id = button.id;
        el.innerHTML = button.icon;
        el.style.cssText = `
			width: 36px;
			height: 28px;
			background: rgba(0, 20, 40, 0.85);
			border: 1px solid rgba(0, 255, 255, 0.3);
			border-top: none;
			border-radius: 0 0 6px 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			font-size: 14px;
			color: ${button.id.startsWith('empty-') ? 'rgba(0,255,255,0.25)' : '#0ff'};
			backdrop-filter: blur(4px);
			transition: all 0.2s ease;
			user-select: none;
		`;
        // 悬停效果
        el.onmouseenter = () => {
            if (!button.id.startsWith('empty-')) {
                el.style.background = 'rgba(0, 40, 80, 0.9)';
                el.style.boxShadow = '0 0 10px rgba(0,255,255,0.3)';
            }
        };
        el.onmouseleave = () => {
            el.style.background = 'rgba(0, 20, 40, 0.85)';
            el.style.boxShadow = 'none';
        };
        // 点击事件
        el.onclick = (e) => {
            e.stopPropagation();
            button.onClick();
        };
        return el;
    }
    // 更新滑动位置
    updateSlidePosition() {
        const offset = -this.currentPage * (100 / this.totalPages);
        this.track.style.transform = `translateX(${offset}%)`;
    }
    // 绑定滑动事件
    bindEvents() {
        // 触摸滑动
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.isDragging = true;
            this.dragOffset = 0;
            this.track.style.transition = 'none';
        }, { passive: true });
        this.container.addEventListener('touchmove', (e) => {
            if (!this.isDragging)
                return;
            const currentX = e.touches[0].clientX;
            this.dragOffset = currentX - this.touchStartX;
            // 实时跟随手指移动
            const baseOffset = -this.currentPage * (100 / this.totalPages);
            const percentOffset = (this.dragOffset / this.container.offsetWidth) * 100;
            this.track.style.transform = `translateX(${baseOffset + percentOffset}%)`;
        }, { passive: true });
        this.container.addEventListener('touchend', (e) => {
            if (!this.isDragging)
                return;
            this.isDragging = false;
            this.track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            const threshold = this.container.offsetWidth * 0.15;
            if (this.dragOffset < -threshold && this.currentPage < this.totalPages - 1) {
                this.nextPage();
            }
            else if (this.dragOffset > threshold && this.currentPage > 0) {
                this.prevPage();
            }
            else {
                // 回弹
                this.updateSlidePosition();
            }
        }, { passive: true });
        // 鼠标拖拽（桌面端）
        this.container.addEventListener('mousedown', (e) => {
            this.touchStartX = e.clientX;
            this.isDragging = true;
            this.dragOffset = 0;
            this.track.style.transition = 'none';
        });
        this.container.addEventListener('mousemove', (e) => {
            if (!this.isDragging)
                return;
            this.dragOffset = e.clientX - this.touchStartX;
            const baseOffset = -this.currentPage * (100 / this.totalPages);
            const percentOffset = (this.dragOffset / this.container.offsetWidth) * 100;
            this.track.style.transform = `translateX(${baseOffset + percentOffset}%)`;
        });
        this.container.addEventListener('mouseup', (e) => {
            if (!this.isDragging)
                return;
            this.isDragging = false;
            this.track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            const threshold = this.container.offsetWidth * 0.15;
            if (this.dragOffset < -threshold && this.currentPage < this.totalPages - 1) {
                this.nextPage();
            }
            else if (this.dragOffset > threshold && this.currentPage > 0) {
                this.prevPage();
            }
            else {
                this.updateSlidePosition();
            }
        });
        this.container.addEventListener('mouseleave', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                this.updateSlidePosition();
            }
        });
        // 滚轮翻页
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0 || e.deltaX > 0) {
                this.nextPage();
            }
            else {
                this.prevPage();
            }
        }, { passive: false });
    }
    // 下一页
    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.updateSlidePosition();
            this.updatePageIndicator();
            if (window.logger)
                logger.log('TOOLBAR', `切换到第 ${this.currentPage + 1} 页`);
        }
    }
    // 上一页
    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.updateSlidePosition();
            this.updatePageIndicator();
            if (window.logger)
                logger.log('TOOLBAR', `切换到第 ${this.currentPage + 1} 页`);
        }
    }
    // 跳转到指定页
    goToPage(page) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.updateSlidePosition();
            this.updatePageIndicator();
        }
    }
    // ========== 原有功能方法 ==========
    // 返回按钮 - 调用屏幕管理器
    goBack() {
        if (window.logger)
            logger.log('TOOLBAR', 'Back button clicked');
        // 优先关闭面板
        const settingsPanel = document.getElementById('settings-panel');
        const debugPanel = document.getElementById('debug-panel');
        if (settingsPanel && settingsPanel.style.display !== 'none') {
            settingsPanel.style.display = 'none';
            return;
        }
        if (debugPanel && debugPanel.style.display !== 'none') {
            debugPanel.style.display = 'none';
            return;
        }
        // 调用屏幕管理器处理返回
        if (window.screenManager) {
            window.screenManager.handleBack();
        }
    }
    // 切换全屏
    async toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                if (window.logger)
                    logger.log('TOOLBAR', '进入全屏');
            }
            else {
                await document.exitFullscreen();
                if (window.logger)
                    logger.log('TOOLBAR', '退出全屏');
            }
            // 延迟触发 resize，等待屏幕尺寸稳定（全屏切换可能需要更长时间）
            setTimeout(() => {
                this._notifyResize();
            }, 500);
        }
        catch (e) {
            console.log('全屏切换失败:', e);
        }
    }
    // 切换屏幕方向（转屏）
    async toggleOrientation() {
        try {
            if (!screen.orientation) {
                if (window.logger)
                    logger.log('TOOLBAR', '当前设备不支持屏幕方向锁定');
                return;
            }
            // 使用 window.innerWidth/Height 判断当前方向更准确
            const isLandscape = window.innerWidth > window.innerHeight;
            if (window.logger)
                logger.log('TOOLBAR', `当前方向: ${isLandscape ? '横屏' : '竖屏'}, 准备切换...`);
            let lockResult;
            if (isLandscape) {
                // 当前是横屏，切换到竖屏
                lockResult = await screen.orientation.lock('portrait').catch((e) => e);
                if (lockResult instanceof Error) {
                    if (window.logger)
                        logger.log('TOOLBAR', `切换到竖屏失败: ${lockResult.message}`);
                }
                else {
                    if (window.logger)
                        logger.log('TOOLBAR', '切换到竖屏成功');
                }
            }
            else {
                // 当前是竖屏，切换到横屏
                lockResult = await screen.orientation.lock('landscape').catch((e) => e);
                if (lockResult instanceof Error) {
                    if (window.logger)
                        logger.log('TOOLBAR', `切换到横屏失败: ${lockResult.message}`);
                }
                else {
                    if (window.logger)
                        logger.log('TOOLBAR', '切换到横屏成功');
                }
            }
            // 延迟触发 resize，等待屏幕尺寸稳定
            setTimeout(() => {
                this._notifyResize();
            }, 500);
        }
        catch (e) {
            if (window.logger)
                logger.log('TOOLBAR', `转屏失败: ${e.message}`);
            console.log('转屏失败:', e);
        }
    }
    /**
     * 通知当前屏幕触发 resize 处理
     * 用于全屏切换后的强制刷新
     */
    _notifyResize() {
        // 通知当前屏幕
        if (window.screenManager && window.screenManager.currentScreen) {
            const screen = window.screenManager.currentScreen;
            if (screen.resize) {
                screen.resize();
                if (window.logger)
                    logger.log('TOOLBAR', 'Notified current screen to resize');
            }
        }
        // 同时触发全局 resize 事件（让其他监听者也能收到）
        window.dispatchEvent(new Event('resize'));
    }
    // 切换设置面板
    toggleSettings() {
        let panel = document.getElementById('settings-panel');
        if (!panel) {
            this.createSettingsPanel();
            panel = document.getElementById('settings-panel');
        }
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
    // 切换调试面板
    toggleDebugPanel() {
        let panel = document.getElementById('debug-panel');
        if (!panel) {
            this.createDebugPanel();
            panel = document.getElementById('debug-panel');
        }
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
    /**
     * 相机缩放滑动条变化回调
     * @param {string} value - 视野大小系数 1-10
     */
    _onCameraZoomChange(value) {
        const viewScale = parseInt(value);
        // 更新显示值
        const valueDisplay = document.getElementById('camera-zoom-value');
        if (valueDisplay) {
            valueDisplay.textContent = viewScale;
        }
        // 通知当前屏幕设置相机缩放
        if (window.screenManager && window.screenManager.currentScreen) {
            const screen = window.screenManager.currentScreen;
            if (screen.setCameraZoom) {
                screen.setCameraZoom(viewScale);
                if (window.logger)
                    logger.log('TOOLBAR', `View scale set to ${viewScale}`);
            }
        }
    }
    // 创建设置面板
    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'settings-panel';
        panel.style.cssText = `
			display: none;
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 280px;
			background: rgba(0, 20, 40, 0.95);
			border: 1px solid rgba(0, 255, 255, 0.3);
			border-radius: 8px;
			padding: 20px;
			z-index: ${UILayers.getAbove(UILayers.TOOLBAR)};
			color: #0ff;
			font-family: inherit;
		`;
        panel.innerHTML = `
			<h3 style="margin-bottom:20px;text-align:center;text-shadow:0 0 10px #0ff;">⚙ 设置</h3>
			<p style="text-align:center;color:#888;font-size:12px;">暂无可用设置项</p>
			<div style="text-align:center;margin-top:20px;">
				<button onclick="document.getElementById('settings-panel').style.display='none'" 
						style="padding:10px 30px;background:transparent;border:2px solid #0ff;color:#0ff;cursor:pointer;font-family:inherit;border-radius:4px;">关闭</button>
			</div>
		`;
        document.body.appendChild(panel);
    }
    // 创建调试面板
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
			display: none;
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 280px;
			background: rgba(0, 20, 40, 0.95);
			border: 1px solid rgba(0, 255, 255, 0.3);
			border-radius: 8px;
			padding: 20px;
			z-index: ${UILayers.getAbove(UILayers.TOOLBAR)};
			color: #0ff;
			font-family: inherit;
		`;
        panel.innerHTML = `
			<h3 style="margin-bottom:20px;text-align:center;text-shadow:0 0 10px #0ff;">🐛 调试面板</h3>
			
			<!-- 相机缩放控制 -->
			<div style="margin-bottom:20px;">
				<label style="display:block;margin-bottom:10px;font-size:14px;">视野大小</label>
				<input type="range" id="camera-zoom-slider" min="1" max="10" step="1" value="1"
					   style="width:100%;cursor:pointer;"
					   oninput="window.toolbar._onCameraZoomChange(this.value)">
				<div style="display:flex;justify-content:space-between;margin-top:5px;font-size:12px;color:#888;">
					<span>1 (近)</span>
					<span id="camera-zoom-value">1</span>
					<span>10 (远)</span>
				</div>
			</div>
			
			<div style="text-align:center;margin-top:20px;">
				<button onclick="document.getElementById('debug-panel').style.display='none'" 
						style="padding:10px 30px;background:transparent;border:2px solid #0ff;color:#0ff;cursor:pointer;font-family:inherit;border-radius:4px;">关闭</button>
			</div>
		`;
        document.body.appendChild(panel);
    }
    // 更新日志按钮状态
    updateLogButton(isOpen) {
        const logBtn = this.allButtons.find(b => b.id === 'log');
        if (logBtn && logBtn.element) {
            logBtn.element.innerHTML = isOpen ? '◆' : '◇';
        }
    }
    // ========== 公开API ==========
    // 动态添加工具按钮
    addToolButton(config) {
        // 自动分配页和位置
        const { page, index } = this.findAvailableSlot();
        config.page = page;
        config.indexInPage = index;
        const button = this.registerButton(config);
        // 重新渲染所有页面
        this.renderAllPages();
        return button;
    }
    // 查找可用槽位
    findAvailableSlot() {
        for (let p = 0; p < this.totalPages; p++) {
            for (let i = 0; i < this.buttonsPerPage; i++) {
                const occupied = this.allButtons.find(b => b.page === p && b.indexInPage === i);
                if (!occupied || occupied.id.startsWith('empty-')) {
                    return { page: p, index: i };
                }
            }
        }
        // 如果都满了，添加到最后一页末尾（会自动扩展）
        return { page: this.totalPages - 1, index: this.buttonsPerPage };
    }
    // 移除按钮
    removeButton(id) {
        const index = this.allButtons.findIndex(b => b.id === id);
        if (index !== -1) {
            this.allButtons.splice(index, 1);
            this.renderAllPages();
            return true;
        }
        return false;
    }
    // 获取按钮
    getButton(id) {
        return this.allButtons.find(b => b.id === id);
    }
    // 设置总页数
    setTotalPages(count) {
        this.totalPages = Math.max(1, count);
        if (this.currentPage >= this.totalPages) {
            this.currentPage = this.totalPages - 1;
        }
        this.renderAllPages();
    }
}
// 导出
window.Toolbar = Toolbar;
//# sourceMappingURL=toolbar.js.map