/**
 * ScreenManager 屏幕管理器
 * 管理屏幕生命周期、导航栈、转场效果
 */

class ScreenManager {
	screens: Map<typeof Screen, Screen> = new Map();
	screenStack: Screen[] = [];
	currentScreen: Screen | null = null;
	launchScreen: Screen | null = null;
	popping: boolean = false;

	// 转场状态
	transitionState: 'NONE' | 'FADE_OUT' | 'FADE_IN' | 'LOADING_WAIT' | 'OVERLAY_FADE' = 'NONE';
	transitionTime: number = 0;
	transitionDuration: number = 0.5;
	onTransitionMiddle: (() => void) | null = null;
	onTransitionEnd: (() => void) | null = null;
	overlayFadeDuration: number = 0.5;

	// Loading 转场
	loadingTaskFinished: boolean = false;
	loadingMinDuration: number = 0;
	loadingElapsedTime: number = 0;

	constructor() {
		// 初始化
	}

	/**
	 * 注册屏幕
	 */
	register(screenClass: typeof Screen, instance?: Screen): this {
		if (this.screens.has(screenClass)) {
			if (window.logger) window.logger.log('SCREEN_MGR', `${screenClass.name} already registered`);
			return this;
		}
		if (!instance) {
			instance = new screenClass(this);
		}
		instance.screenManager = this;
		this.screens.set(screenClass, instance);
		if (window.logger) window.logger.log('SCREEN_MGR', `Registered ${screenClass.name}`);
		return this;
	}

	/**
	 * 设置启动屏幕
	 */
	setLaunchScreen(screenClass: typeof Screen): this {
		this.launchScreen = this._getOrCreate(screenClass);
		this.goScreen(screenClass);
		return this;
	}

	/**
	 * 进入屏幕（入栈，可返回）
	 */
	goScreen(screenClass: typeof Screen): this {
		const next = this._getOrCreate(screenClass);
		return this._goScreenInstance(next);
	}
	
	/**
	 * 进入屏幕实例（入栈，可返回）
	 * 如果已是当前屏幕，直接忽略（幂等操作）
	 */
	_goScreenInstance(screen: Screen): this {
		// 相同屏幕直接忽略
		if (this.currentScreen === screen) {
			return this;
		}

		this._initializeScreen(screen);

		// 隐藏当前并入栈
		if (this.currentScreen) {
			this.currentScreen.exit();
			if (!this.popping) {
				this.screenStack.push(this.currentScreen);
			}
		}

		this.currentScreen = screen;
		this.currentScreen.enter();

		if (window.logger) window.logger.log('SCREEN_MGR', `Go screen: ${screen.constructor.name}, stack: [${this.getStackInfo()}]`);
		return this;
	}

	/**
	 * 仅显示屏幕（不入栈）
	 */
	showScreen(screenClass: typeof Screen): this {
		const next = this._getOrCreate(screenClass);
		if (this.currentScreen === next) return this;

		this._initializeScreen(next);

		if (this.currentScreen) {
			this.currentScreen.exit();
			// 不入栈
		}

		this.currentScreen = next;
		this.currentScreen.enter();

		if (window.logger) window.logger.log('SCREEN_MGR', `Show screen: ${next.constructor.name}`);
		return this;
	}

	/**
	 * 替换屏幕（销毁旧实例，创建新实例）
	 */
	replaceScreen(screenClass: typeof Screen): this {
		if (window.logger) window.logger.log('SCREEN_MGR', `Replace screen: ${screenClass.name}`);
		// 移除旧实例
		if (this.screens.has(screenClass)) {
			const old = this.screens.get(screenClass)!;
			old.destroy();
			this.screens.delete(screenClass);
		}
		return this.goScreen(screenClass);
	}

	/**
	 * 返回上个屏幕（弹出栈）
	 * @return true 如果成功返回到栈中的屏幕，false 如果栈为空
	 */
	popScreen(): boolean {
		if (this.screenStack.length === 0) {
			if (window.logger) window.logger.log('SCREEN_MGR', 'Pop failed: stack empty');
			return false;
		}

		const prev = this.screenStack.pop()!;
		this.popping = true;
		this._goScreenInstance(prev);  // 使用实例版本，不重新创建
		this.popping = false;
		
		if (window.logger) window.logger.log('SCREEN_MGR', `Pop to: ${prev.constructor.name}, stack: [${this.getStackInfo()}]`);
		return true;
	}

	/**
	 * 回退到指定类型的屏幕
	 */
	popTo(targetClass: typeof Screen): boolean {
		if (this.currentScreen && this.currentScreen.constructor === targetClass) return true;

		let targetIndex = -1;
		for (let i = this.screenStack.length - 1; i >= 0; i--) {
			if (this.screenStack[i].constructor === targetClass) {
				targetIndex = i;
				break;
			}
		}

		if (targetIndex === -1) return false;

		while (this.screenStack.length > targetIndex + 1) {
			this.screenStack.pop();
		}

		return this.popScreen();
	}

	/**
	 * 清空栈
	 */
	clearStack(): void {
		this.screenStack.length = 0;
	}

	/**
	 * 获取当前屏幕
	 */
	getCurrentScreen(): Screen | null {
		return this.currentScreen;
	}

	/**
	 * 获取栈信息字符串
	 */
	getStackInfo(): string {
		const names = this.screenStack.map(s => s.constructor.name);
		if (this.currentScreen) {
			names.push(this.currentScreen.constructor.name);
		}
		return names.join(' -> ');
	}

	/**
	 * 处理返回键
	 */
	handleBack(): boolean {
		if (this.isTransitioning()) return true;

		if (this.currentScreen && this.currentScreen.handleBack()) {
			return true;
		}

		return this.popScreen();
	}

	/**
	 * 是否正在转场
	 */
	isTransitioning(): boolean {
		return this.transitionState !== 'NONE';
	}

	/**
	 * 渲染当前屏幕
	 */
	render(delta: number): void {
		if (this.currentScreen && this.currentScreen.visible) {
			this.currentScreen.render(delta);
		}

		// 渲染转场覆盖层
		this._renderTransitionOverlay();
	}

	// ---------- 私有方法 ----------

	_getOrCreate(screenClass: typeof Screen): Screen {
		if (!this.screens.has(screenClass)) {
			const instance = new screenClass(this);
			this.screens.set(screenClass, instance);
			if (window.logger) window.logger.log('SCREEN_MGR', `Created ${screenClass.name}`);
		}
		return this.screens.get(screenClass)!;
	}

	_initializeScreen(screen: Screen): void {
		if (!screen.initialized) {
			screen.initialize();
		}
	}

	_updateTransition(delta: number): void {
		if (this.transitionState === 'NONE') return;

		this.transitionTime += delta;

		switch (this.transitionState) {
			case 'FADE_OUT':
				if (this.transitionTime >= this.transitionDuration) {
					if (this.onTransitionMiddle) {
						this.onTransitionMiddle();
						this.onTransitionMiddle = null;
					}
					this.transitionState = 'FADE_IN';
					this.transitionTime = 0;
				}
				break;
			case 'FADE_IN':
				if (this.transitionTime >= this.transitionDuration) {
					this.transitionState = 'NONE';
					if (this.onTransitionEnd) {
						this.onTransitionEnd();
						this.onTransitionEnd = null;
					}
				}
				break;
		}
	}

	_renderTransitionOverlay(): void {
		// 转场效果渲染（简化实现）
	}
}

(window as any).ScreenManager = ScreenManager;
