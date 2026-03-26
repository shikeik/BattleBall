/**
 * ScreenManager 屏幕管理器
 */
declare class ScreenManager {
    screens: Map<any, any>;
    screenStack: any[];
    currentScreen: any;
    launchScreen: any;
    popping: boolean;
    transitionState: any;
    transitionTime: number;
    transitionDuration: number;
    onTransitionMiddle: any;
    onTransitionEnd: any;
    overlayFadeDuration: number;
    loadingTaskFinished: boolean;
    loadingMinDuration: number;
    loadingElapsedTime: number;
    constructor();
    register(screenClass: any, instance?: any): this;
    setLaunchScreen(screenClass: any): this;
    goScreen(screenClass: any): this;
    _goScreenInstance(screen: any): this;
    showScreen(screenClass: any): this;
    replaceScreen(screenClass: any): this;
    popScreen(): boolean;
    popTo(targetClass: any): boolean;
    clearStack(): void;
    getCurrentScreen(): any;
    getStackInfo(): string;
    handleBack(): boolean;
    isTransitioning(): boolean;
    render(delta: number): void;
    _getOrCreate(screenClass: any): any;
    _initializeScreen(screen: any): void;
}
