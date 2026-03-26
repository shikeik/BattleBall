/**
 * ScreenManager 屏幕管理器
 * 管理屏幕生命周期、导航栈、转场效果
 */
class ScreenManager {
	constructor() {
		this.screens = new Map();
		this.screenStack = [];
		this.currentScreen = null;
		this.launchScreen = null;
		this.popping = false;

		// 转场状态
		this.transitionState = 'NONE';
		this.transitionTime = 0;
		this.transitionDuration = 0.5;
		this.onTransitionMiddle = null;
		this.onTransitionEnd = null;
		this.overlayFadeDuration = 0.5;

		// Loading 转场
		this.loadingTaskFinished = false;
		this.loadingMinDuration = 0;
		this.loadingElapsedTime = 0;
	}

	/**
	 * 注册屏幕
	 */
	register(screenClass, instance) {
		if (this.screens.has(screenClass)) {
			if (window.logger) logger.log('SCREEN_MGR', `${screenClass.name} already registered`);
			return this;
		}
		if (!instance) {
			instance = new screenClass(this);
		}
		instance.screenManager = this;
		this.screens.set(screenClass, instance);
		if (window.logger) logger.log('SCREEN_MGR', `Registered ${screenClass.name}`);
		return this;
	}

	/**
	 * 设置启动屏幕
	 */
	setLaunchScreen(screenClass) {
		this.launchScreen = screenClass;
		this.goScreen(screenClass);
		return this;
	}

	/**
	 * 进入屏幕（入栈，可返回）
	 */
	goScreen(screenClass) {
		const next = this._getOrCreate(screenClass);
		return this._goScreenInstance(next);
	}
	
	/**
	 * 进入屏幕实例（入栈，可返回）
	 * 如果已是当前屏幕，直接忽略（幂等操作）
	 */
	_goScreenInstance(screen) {
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

		if (window.logger) logger.log('SCREEN_MGR', `Go screen: ${screen.constructor.name}, stack: [${this.getStackInfo()}]`);
		return this;
	}

	/**
	 * 仅显示屏幕（不入栈）
	 */
	showScreen(screenClass) {
		const next = this._getOrCreate(screenClass);
		if (this.currentScreen === next) return this;

		this._initializeScreen(next);

		if (this.currentScreen) {
			this.currentScreen.exit();
			// 不入栈
		}

		this.currentScreen = next;
		this.currentScreen.enter();

		if (window.logger) logger.log('SCREEN_MGR', `Show screen: ${next.constructor.name}`);
		return this;
	}

	/**
	 * 替换屏幕（销毁旧实例，创建新实例）
	 */
	replaceScreen(screenClass) {
		if (window.logger) logger.log('SCREEN_MGR', `Replace screen: ${screenClass.name}`);
		// 移除旧实例
		if (this.screens.has(screenClass)) {
			const old = this.screens.get(screenClass);
			old.destroy();
			this.screens.delete(screenClass);
		}
		return this.goScreen(screenClass);
	}

	/**
	 * 返回上个屏幕（弹出栈）
	 * @return true 如果成功返回到栈中的屏幕，false 如果栈为空
	 */
	popScreen() {
		if (this.screenStack.length === 0) {
			if (window.logger) logger.log('SCREEN_MGR', 'Pop failed: stack empty');
			return false;
		}

		const prev = this.screenStack.pop();
		this.popping = true;
		this._goScreenInstance(prev);  // 使用实例版本，不重新创建
		this.popping = false;
		
		if (window.logger) logger.log('SCREEN_MGR', `Pop to: ${prev.constructor.name}, stack: [${this.getStackInfo()}]`);
		return true;
	}

	/**
	 * 回退到指定类型的屏幕
	 */
	popTo(targetClass) {
		if (this.currentScreen && this.currentScreen.constructor === targetClass) {
			return true;
		}

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
	 * 清空导航栈
	 */
	clearStack() {
		this.screenStack.length = 0;
		if (window.logger) logger.log('SCREEN_MGR', 'Stack cleared');
	}

	/**
	 * 获取当前屏幕
	 */
	getCurrentScreen() {
		return this.currentScreen;
	}

	/**
	 * 获取导航栈信息
	 */
	getStackInfo() {
		const stack = this.screenStack.map(s => s.constructor.name);
		if (this.currentScreen) {
			stack.push(this.currentScreen.constructor.name);
		}
		return stack.join(' -> ');
	}

	/**
	 * 开始淡入淡出转场
	 */
	playTransition(onMiddle, onEnd) {
		if (this.transitionState !== 'NONE') return;

		this.transitionState = 'FADE_OUT';
		this.transitionTime = 0;
		this.onTransitionMiddle = onMiddle;
		this.onTransitionEnd = onEnd;

		if (window.logger) logger.log('SCREEN_MGR', 'Transition start');
	}

	/**
	 * 带加载动画的转场
	 */
	playLoadingTransition(loader, tipText, minDuration) {
		if (this.transitionState !== 'NONE') return;

		this.loadingMinDuration = minDuration || 0;
		this.loadingElapsedTime = 0;
		this.loadingTaskFinished = false;

		this.playTransition(() => {
			this.transitionState = 'LOADING_WAIT';
			if (loader) {
				loader(() => {
					this.loadingTaskFinished = true;
				});
			} else {
				this.loadingTaskFinished = true;
			}
		});
	}

	/**
	 * 无等待渐变（覆盖层淡出）
	 */
	playOverlayFade(action, fadeDuration) {
		if (action) action();

		this.transitionState = 'OVERLAY_FADE';
		this.transitionTime = 0;
		this.overlayFadeDuration = fadeDuration || 0.5;
	}

	/**
	 * 是否正在转场
	 */
	isTransitioning() {
		return this.transitionState !== 'NONE';
	}

	/**
	 * 主渲染入口
	 */
	render(delta) {
		// 转场更新
		this._updateTransition(delta);

		// 渲染当前屏幕
		if (this.currentScreen && this.currentScreen.visible) {
			this.currentScreen.render(delta);
		}

		// 渲染转场覆盖层
		this._renderTransitionOverlay();
	}

	/**
	 * 处理返回键
	 */
	handleBack() {
		if (this.isTransitioning()) return true;

		if (this.currentScreen && this.currentScreen.handleBack()) {
			return true;
		}

		return this.popScreen();
	}

	// ---------- 私有方法 ----------

	_getOrCreate(screenClass) {
		if (!this.screens.has(screenClass)) {
			if (typeof screenClass !== 'function') {
				throw new Error(`screenClass is not a constructor: ${screenClass} (type: ${typeof screenClass})`);
			}
			const instance = new screenClass(this);
			this.screens.set(screenClass, instance);
			instance.screenManager = this;
			if (window.logger) logger.log('SCREEN_MGR', `Created ${screenClass.name}`);
		}
		return this.screens.get(screenClass);
	}

	_initializeScreen(screen) {
		if (!screen.initialized) {
			screen.initialize();
		}
	}

	_updateTransition(delta) {
		if (this.transitionState === 'NONE') return;

		this.transitionTime += delta;

		switch (this.transitionState) {
			case 'FADE_OUT':
				if (this.transitionTime >= this.transitionDuration) {
					if (this.onTransitionMiddle) {
						this.onTransitionMiddle();
						this.onTransitionMiddle = null;
					}
					if (this.transitionState === 'FADE_OUT') {
						this.transitionState = 'FADE_IN';
					}
					this.transitionTime = 0;
				}
				break;

			case 'LOADING_WAIT':
				this.loadingElapsedTime += delta;
				if (this.loadingElapsedTime >= this.loadingMinDuration && this.loadingTaskFinished) {
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

			case 'OVERLAY_FADE':
				if (this.transitionTime >= this.overlayFadeDuration) {
					this.transitionState = 'NONE';
				}
				break;
		}
	}

	_renderTransitionOverlay() {
		if (this.transitionState === 'NONE') return;

		let alpha = 0;

		switch (this.transitionState) {
			case 'FADE_OUT':
				alpha = Math.min(1, this.transitionTime / this.transitionDuration);
				break;
			case 'LOADING_WAIT':
				alpha = 1;
				break;
			case 'FADE_IN':
				alpha = 1 - Math.min(1, this.transitionTime / this.transitionDuration);
				break;
			case 'OVERLAY_FADE':
				alpha = 1 - Math.min(1, this.transitionTime / this.overlayFadeDuration);
				break;
		}

		if (alpha > 0 && window.renderer) {
			// 绘制黑色覆盖层
			const ctx = window.renderer.ctx;
			if (ctx) {
				ctx.save();
				ctx.globalAlpha = alpha;
				ctx.fillStyle = '#000';
				ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				ctx.restore();
			}
		}
	}
}

window.ScreenManager = ScreenManager;
