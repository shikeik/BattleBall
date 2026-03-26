/**
 * SceneManager 场景管理器
 * 管理场景生命周期、导航栈、转场效果
 */
class SceneManager {
	constructor() {
		this.scenes = new Map();
		this.sceneStack = [];
		this.currentScene = null;
		this.launchScene = null;
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
	 * 注册场景
	 */
	register(sceneClass, instance) {
		if (!instance) {
			instance = new sceneClass(this);
		}
		instance.sceneManager = this;
		this.scenes.set(sceneClass, instance);
		if (window.logger) logger.log('SCENE_MGR', `Registered ${sceneClass.name}`);
		return this;
	}

	/**
	 * 设置启动场景
	 */
	setLaunchScene(sceneClass) {
		this.launchScene = this._getOrCreate(sceneClass);
		this.goScene(this.launchScene);
		return this;
	}

	/**
	 * 进入场景（入栈，可返回）
	 */
	goScene(sceneClass) {
		const next = this._getOrCreate(sceneClass);

		// 相同场景忽略
		if (this.currentScene === next) return this;

		this._initializeScene(next);

		// 隐藏当前并入栈
		if (this.currentScene) {
			this.currentScene.exit();
			if (!this.popping) {
				this.sceneStack.push(this.currentScene);
			}
		}

		this.currentScene = next;
		this.currentScene.enter();

		if (window.logger) logger.log('SCENE_MGR', `Go scene: ${next.constructor.name}, stack: [${this.getStackInfo()}]`);
		return this;
	}

	/**
	 * 仅显示场景（不入栈）
	 */
	showScene(sceneClass) {
		const next = this._getOrCreate(sceneClass);
		if (this.currentScene === next) return this;

		this._initializeScene(next);

		if (this.currentScene) {
			this.currentScene.exit();
			// 不入栈
		}

		this.currentScene = next;
		this.currentScene.enter();

		if (window.logger) logger.log('SCENE_MGR', `Show scene: ${next.constructor.name}`);
		return this;
	}

	/**
	 * 替换场景（重新创建）
	 */
	replaceScene(sceneClass) {
		// 移除旧实例
		if (this.scenes.has(sceneClass)) {
			const old = this.scenes.get(sceneClass);
			old.destroy();
			this.scenes.delete(sceneClass);
		}
		return this.goScene(sceneClass);
	}

	/**
	 * 返回上个场景
	 */
	popScene() {
		if (this.sceneStack.length === 0) {
			if (window.logger) logger.log('SCENE_MGR', 'Pop failed: stack empty');
			return false;
		}

		const prev = this.sceneStack.pop();
		this.popping = true;

		if (this.currentScene) {
			this.currentScene.exit();
		}

		this.currentScene = prev;
		this.currentScene.enter();

		this.popping = false;

		if (window.logger) logger.log('SCENE_MGR', `Pop to: ${prev.constructor.name}, stack: [${this.getStackInfo()}]`);
		return true;
	}

	/**
	 * 回退到指定类型的场景
	 */
	popTo(targetClass) {
		if (this.currentScene && this.currentScene.constructor === targetClass) {
			return true;
		}

		let targetIndex = -1;
		for (let i = this.sceneStack.length - 1; i >= 0; i--) {
			if (this.sceneStack[i].constructor === targetClass) {
				targetIndex = i;
				break;
			}
		}

		if (targetIndex === -1) return false;

		while (this.sceneStack.length > targetIndex + 1) {
			this.sceneStack.pop();
		}

		return this.popScene();
	}

	/**
	 * 清空导航栈
	 */
	clearStack() {
		this.sceneStack.length = 0;
		if (window.logger) logger.log('SCENE_MGR', 'Stack cleared');
	}

	/**
	 * 获取当前场景
	 */
	getCurrentScene() {
		return this.currentScene;
	}

	/**
	 * 获取导航栈信息
	 */
	getStackInfo() {
		const stack = this.sceneStack.map(s => s.constructor.name);
		if (this.currentScene) {
			stack.push(this.currentScene.constructor.name);
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

		if (window.logger) logger.log('SCENE_MGR', 'Transition start');
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

		// 渲染当前场景
		if (this.currentScene && this.currentScene.visible) {
			this.currentScene.render(delta);
		}

		// 渲染转场覆盖层
		this._renderTransitionOverlay();
	}

	/**
	 * 处理返回键
	 */
	handleBack() {
		if (this.isTransitioning()) return true;

		if (this.currentScene && this.currentScene.handleBack()) {
			return true;
		}

		return this.popScene();
	}

	// ---------- 私有方法 ----------

	_getOrCreate(sceneClass) {
		if (!this.scenes.has(sceneClass)) {
			this.register(sceneClass, new sceneClass(this));
		}
		return this.scenes.get(sceneClass);
	}

	_initializeScene(scene) {
		if (!scene.initialized) {
			scene.initialize();
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

window.SceneManager = SceneManager;
