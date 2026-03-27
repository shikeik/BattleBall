/**
 * ScreenManager 屏幕管理器
 */
class ScreenManager {
	screens: Map<any, any> = new Map();
	screenStack: any[] = [];
	currentScreen: any = null;
	launchScreen: any = null;
	popping: boolean = false;
	transitionState: any = 'NONE';
	transitionTime: number = 0;
	transitionDuration: number = 0.5;
	onTransitionMiddle: any = null;
	onTransitionEnd: any = null;
	overlayFadeDuration: number = 0.5;
	loadingTaskFinished: boolean = false;
	loadingMinDuration: number = 0;
	loadingElapsedTime: number = 0;

	constructor() {}

	register(screenClass: any, instance?: any): this {
		if (this.screens.has(screenClass)) {
			if (window.logger) window.logger.log('SCREEN_MGR', `${screenClass.name} already registered`);
			return this;
		}
		if (!instance) instance = new screenClass(this);
		instance.screenManager = this;
		this.screens.set(screenClass, instance);
		if (window.logger) window.logger.log('SCREEN_MGR', `Registered ${screenClass.name}`);
		return this;
	}

	setLaunchScreen(screenClass: any): this {
		this.launchScreen = this._getOrCreate(screenClass);
		this.goScreen(screenClass);
		return this;
	}

	goScreen(screenClass: any): this {
		const next = this._getOrCreate(screenClass);
		return this._goScreenInstance(next);
	}

	_goScreenInstance(screen: any): this {
		if (this.currentScreen === screen) return this;
		this._initializeScreen(screen);
		if (this.currentScreen) {
			this.currentScreen.exit();
			if (!this.popping) this.screenStack.push(this.currentScreen);
		}
		this.currentScreen = screen;
		this.currentScreen.enter();
		if (window.logger) window.logger.log('SCREEN_MGR', `Go screen: ${screen.constructor.name}, stack: [${this.getStackInfo()}]`);
		return this;
	}

	showScreen(screenClass: any): this {
		const next = this._getOrCreate(screenClass);
		if (this.currentScreen === next) return this;
		this._initializeScreen(next);
		if (this.currentScreen) this.currentScreen.exit();
		this.currentScreen = next;
		this.currentScreen.enter();
		if (window.logger) window.logger.log('SCREEN_MGR', `Show screen: ${next.constructor.name}`);
		return this;
	}

	replaceScreen(screenClass: any): this {
		if (window.logger) window.logger.log('SCREEN_MGR', `Replace screen: ${screenClass.name}`);
		if (this.screens.has(screenClass)) {
			this.screens.get(screenClass).destroy();
			this.screens.delete(screenClass);
		}
		return this.goScreen(screenClass);
	}

	popScreen(): boolean {
		if (this.screenStack.length === 0) {
			if (window.logger) window.logger.log('SCREEN_MGR', 'Pop failed: stack empty');
			return false;
		}
		const prev = this.screenStack.pop();
		this.popping = true;
		this._goScreenInstance(prev);
		this.popping = false;
		if (window.logger) window.logger.log('SCREEN_MGR', `Pop to: ${prev.constructor.name}, stack: [${this.getStackInfo()}]`);
		return true;
	}

	popTo(targetClass: any): boolean {
		if (this.currentScreen && this.currentScreen.constructor === targetClass) return true;
		let targetIndex = -1;
		for (let i = this.screenStack.length - 1; i >= 0; i--) {
			if (this.screenStack[i].constructor === targetClass) {
				targetIndex = i;
				break;
			}
		}
		if (targetIndex === -1) return false;
		while (this.screenStack.length > targetIndex + 1) this.screenStack.pop();
		return this.popScreen();
	}

	clearStack(): void { this.screenStack.length = 0; }
	getCurrentScreen(): any { return this.currentScreen; }
	getStackInfo(): string {
		const names = this.screenStack.map((s: any) => s.constructor.name);
		if (this.currentScreen) names.push(this.currentScreen.constructor.name);
		return names.join(' -> ');
	}
	handleBack(): boolean {
		if (this.isTransitioning()) return true;
		if (this.currentScreen && this.currentScreen.handleBack()) return true;
		return this.popScreen();
	}
	isTransitioning(): boolean { return this.transitionState !== 'NONE'; }
	render(delta: number): void {
		if (this.currentScreen && this.currentScreen.visible) this.currentScreen.render(delta);
	}

	_getOrCreate(screenClass: any): any {
		if (!this.screens.has(screenClass)) {
			const instance = new screenClass(this);
			this.screens.set(screenClass, instance);
			if (window.logger) window.logger.log('SCREEN_MGR', `Created ${screenClass.name}`);
		}
		return this.screens.get(screenClass);
	}

	_initializeScreen(screen: any): void {
		if (!screen.initialized) screen.initialize();
	}
}

if (typeof window !== 'undefined') {
	window.ScreenManager = ScreenManager;
}
