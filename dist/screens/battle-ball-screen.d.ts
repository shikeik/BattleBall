/**
 * BattleBallScreen - 球球大作战游戏场景
 *
 * 设计：
 * - UI 渲染使用 this.uiViewport（固定 540x960）
 * - 世界渲染使用 this.worldCamera（自定义，跟随玩家）
 */
declare class BattleBallScreen extends Screen {
    init(): void;
    mapSize: number | undefined;
    gridSize: number | undefined;
    mapLeft: number | undefined;
    mapRight: number | undefined;
    mapBottom: number | undefined;
    mapTop: number | undefined;
    player: {
        x: number;
        y: number;
        score: number;
        radius: number;
        color: string;
    } | undefined;
    beanManager: BeanManager | null | undefined;
    beansInitialized: boolean | undefined;
    joystick: Joystick | null | undefined;
    playerSpeed: number | undefined;
    eatCooldown: number | undefined;
    eatCooldownTime: number | undefined;
    /**
     * 初始化世界相机
     */
    _initWorldCamera(): void;
    worldCamera: {
        x: number;
        y: number;
        zoom: number;
        width: any;
        height: any;
    } | undefined;
    enter(): void;
    /**
     * 初始化相机缩放
     */
    _initCameraZoom(): void;
    /**
     * 初始化彩豆
     */
    _initBeans(): Promise<void>;
    exit(): void;
    render(delta: any): void;
    /**
     * 渲染世界（WebGPU）
     */
    _renderWorld(): void;
    /**
     * 渲染游戏 UI
     */
    _renderGameUI(ctx: any): void;
    /**
     * 绘制网格
     */
    _renderGrid(ctx: any, viewW: any, viewH: any): void;
    /**
     * 绘制边界
     */
    _renderBoundary(ctx: any): void;
    /**
     * 绘制玩家
     */
    _renderPlayer(ctx: any): void;
    /**
     * 绘制 UI
     */
    _renderUI(ctx: any): void;
    /**
     * 设置相机缩放
     */
    setCameraZoom(viewScale: any): void;
    /**
     * resize 回调
     */
    onResize(): void;
    /**
     * 初始化摇杆
     */
    _initJoystick(): void;
    /**
     * 更新玩家位置
     */
    _updatePlayer(delta: any): void;
    /**
     * 检测吃掉的彩豆
     */
    _checkEatBeans(delta: any): void;
    /**
     * 积分转半径
     */
    _scoreToRadius(score: any): number;
    _bindEvents(): void;
    _unbindEvents(): void;
    handleBack(): any;
}
