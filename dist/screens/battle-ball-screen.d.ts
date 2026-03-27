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
     * 覆盖父类方法，使用自定义相机
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
     * 初始化相机缩放 - 读取工具条的视野大小设置
     */
    _initCameraZoom(): void;
    /**
     * 初始化彩豆
     */
    _initBeans(): Promise<void>;
    exit(): void;
    render(delta: any): void;
    /**
     * 使用 WebGPU 渲染世界（彩豆）
     */
    _renderWorld(): void;
    /**
     * 使用 2D Canvas 渲染游戏 UI（网格、边界、玩家、摇杆）
     */
    _renderGameUI(ctx: any): void;
    /**
     * 绘制网格（只绘制视口内的部分）
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
     * 绘制彩豆
     */
    _renderBeans(): void;
    /**
     * 绘制 UI（使用 UI Viewport 坐标系）
     */
    _renderUI(ctx: any): void;
    /**
     * 设置相机缩放
     * @param {number} viewScale - 视野大小系数 (1-10)
     *   1 = 3x 放大效果（近距离）
     *   10 = 总览全图甚至更大（远距离）
     */
    setCameraZoom(viewScale: number): void;
    /**
     * resize 回调
     * 基类已经处理了 Viewport 和 canvas 尺寸更新
     * 这里只需要处理世界相机的特殊逻辑
     */ onResize(): void;
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
     * 绑定事件
     */
    _bindEvents(): void;
    /**
     * 解绑事件
     */
    _unbindEvents(): void;
    handleBack(): any;
}
