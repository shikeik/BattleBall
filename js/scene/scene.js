/**
 * Scene 基类
 * 库层只提供 render 方法，业务层自行决定逻辑/渲染分离
 */
class Scene {
	constructor(sceneManager) {
		this.sceneManager = sceneManager;
		this.initialized = false;
		this.visible = false;
	}

	/**
	 * 初始化（幂等）
	 */
	initialize() {
		if (this.initialized) return;
		this.init();
		this.initialized = true;
		if (window.logger) logger.log('SCENE', `${this.constructor.name} initialized`);
	}

	/**
	 * 子类覆盖：初始化资源
	 */
	init() {
		// 子类实现
	}

	/**
	 * 进入场景
	 */
	enter() {
		this.visible = true;
		if (window.logger) logger.log('SCENE', `${this.constructor.name} enter`);
	}

	/**
	 * 离开场景
	 */
	exit() {
		this.visible = false;
		if (window.logger) logger.log('SCENE', `${this.constructor.name} exit`);
	}

	/**
	 * 库层只提供 render 方法。
	 * 业务层若需要逻辑/渲染分离，自行在内部实现。
	 * @param {number} delta - 时间间隔（秒）
	 */
	render(delta) {
		// 子类实现
	}

	/**
	 * 处理返回键
	 * @returns {boolean} 是否已处理
	 */
	handleBack() {
		return false;
	}

	/**
	 * 销毁场景
	 */
	destroy() {
		this.initialized = false;
		if (window.logger) logger.log('SCENE', `${this.constructor.name} destroyed`);
	}
}

window.Scene = Scene;
