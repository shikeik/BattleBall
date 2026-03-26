/**
 * BattleBallScreen - 球球大作战游戏场景
 * 第一阶段：基础框架
 *
 * 设计：
 * - UI 渲染使用 this.uiViewport（固定 540x960）
 * - 世界渲染使用 this.worldCamera（自定义，跟随玩家）
 */
declare class BattleBallScreen extends Screen {
    init(): void;
    canvas: HTMLElement | null | undefined;
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
    exit(): void;
    render(delta: any): void;
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
     * 绘制 UI（使用 UI Viewport 坐标系）
     */
    _renderUI(ctx: any): void;
    /**
     * 设置相机缩放
     */
    setCameraZoom(zoom: any): void;
    /**
     * 窗口大小变化
     */
    resize(): void;
    /**
     * 绑定事件
     */
    _bindEvents(): void;
    _onResize: (() => void) | undefined;
    _onClick: (() => void) | undefined;
    /**
     * 解绑事件
     */
    _unbindEvents(): void;
    handleBack(): any;
}
