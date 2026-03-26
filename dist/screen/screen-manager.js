"use strict";
/**
 * ScreenManager 屏幕管理器
 */
class ScreenManager {
    constructor() {
        this.screens = new Map();
        this.screenStack = [];
        this.currentScreen = null;
        this.launchScreen = null;
        this.popping = false;
        this.transitionState = 'NONE';
        this.transitionTime = 0;
        this.transitionDuration = 0.5;
        this.onTransitionMiddle = null;
        this.onTransitionEnd = null;
        this.overlayFadeDuration = 0.5;
        this.loadingTaskFinished = false;
        this.loadingMinDuration = 0;
        this.loadingElapsedTime = 0;
    }
    register(screenClass, instance) {
        if (this.screens.has(screenClass)) {
            if (window.logger)
                window.logger.log('SCREEN_MGR', `${screenClass.name} already registered`);
            return this;
        }
        if (!instance)
            instance = new screenClass(this);
        instance.screenManager = this;
        this.screens.set(screenClass, instance);
        if (window.logger)
            window.logger.log('SCREEN_MGR', `Registered ${screenClass.name}`);
        return this;
    }
    setLaunchScreen(screenClass) {
        this.launchScreen = this._getOrCreate(screenClass);
        this.goScreen(screenClass);
        return this;
    }
    goScreen(screenClass) {
        const next = this._getOrCreate(screenClass);
        return this._goScreenInstance(next);
    }
    _goScreenInstance(screen) {
        if (this.currentScreen === screen)
            return this;
        this._initializeScreen(screen);
        if (this.currentScreen) {
            this.currentScreen.exit();
            if (!this.popping)
                this.screenStack.push(this.currentScreen);
        }
        this.currentScreen = screen;
        this.currentScreen.enter();
        if (window.logger)
            window.logger.log('SCREEN_MGR', `Go screen: ${screen.constructor.name}, stack: [${this.getStackInfo()}]`);
        return this;
    }
    showScreen(screenClass) {
        const next = this._getOrCreate(screenClass);
        if (this.currentScreen === next)
            return this;
        this._initializeScreen(next);
        if (this.currentScreen)
            this.currentScreen.exit();
        this.currentScreen = next;
        this.currentScreen.enter();
        if (window.logger)
            window.logger.log('SCREEN_MGR', `Show screen: ${next.constructor.name}`);
        return this;
    }
    replaceScreen(screenClass) {
        if (window.logger)
            window.logger.log('SCREEN_MGR', `Replace screen: ${screenClass.name}`);
        if (this.screens.has(screenClass)) {
            this.screens.get(screenClass).destroy();
            this.screens.delete(screenClass);
        }
        return this.goScreen(screenClass);
    }
    popScreen() {
        if (this.screenStack.length === 0) {
            if (window.logger)
                window.logger.log('SCREEN_MGR', 'Pop failed: stack empty');
            return false;
        }
        const prev = this.screenStack.pop();
        this.popping = true;
        this._goScreenInstance(prev);
        this.popping = false;
        if (window.logger)
            window.logger.log('SCREEN_MGR', `Pop to: ${prev.constructor.name}, stack: [${this.getStackInfo()}]`);
        return true;
    }
    popTo(targetClass) {
        if (this.currentScreen && this.currentScreen.constructor === targetClass)
            return true;
        let targetIndex = -1;
        for (let i = this.screenStack.length - 1; i >= 0; i--) {
            if (this.screenStack[i].constructor === targetClass) {
                targetIndex = i;
                break;
            }
        }
        if (targetIndex === -1)
            return false;
        while (this.screenStack.length > targetIndex + 1)
            this.screenStack.pop();
        return this.popScreen();
    }
    clearStack() { this.screenStack.length = 0; }
    getCurrentScreen() { return this.currentScreen; }
    getStackInfo() {
        const names = this.screenStack.map((s) => s.constructor.name);
        if (this.currentScreen)
            names.push(this.currentScreen.constructor.name);
        return names.join(' -> ');
    }
    handleBack() {
        if (this.isTransitioning())
            return true;
        if (this.currentScreen && this.currentScreen.handleBack())
            return true;
        return this.popScreen();
    }
    isTransitioning() { return this.transitionState !== 'NONE'; }
    render(delta) {
        if (this.currentScreen && this.currentScreen.visible)
            this.currentScreen.render(delta);
    }
    _getOrCreate(screenClass) {
        if (!this.screens.has(screenClass)) {
            const instance = new screenClass(this);
            this.screens.set(screenClass, instance);
            if (window.logger)
                window.logger.log('SCREEN_MGR', `Created ${screenClass.name}`);
        }
        return this.screens.get(screenClass);
    }
    _initializeScreen(screen) {
        if (!screen.initialized)
            screen.initialize();
    }
}
if (typeof window !== 'undefined') {
    window.ScreenManager = ScreenManager;
}
//# sourceMappingURL=screen-manager.js.map