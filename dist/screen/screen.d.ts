/**
 * Screen 基类
 * 支持转屏（横竖屏切换）自适应
 *
 * 设计原则：
 * - 基类统一管理 resize 和 canvas 尺寸更新
 * - 子类不需要覆盖 onResize 除非有特殊需求
 * - 参考原版 GScreen 设计
 */
declare class GScreen {
    screenManager: any;
    initialized: boolean;
    visible: boolean;
    uiViewport: any;
    worldCamera: any;
    screenWidth: number;
    screenHeight: number;
    dpr: number;
    private _resizeHandler;
    protected _canvas: HTMLCanvasElement | null;
    constructor(screenManager?: any);
    initialize(): void;
    _updateScreenSize(): void;
    /**
     * 获取 canvas 元素
     * 子类可以覆盖此方法返回特定的 canvas
     */
    getCanvas(): HTMLCanvasElement | null;
    /**
     * 更新 canvas 尺寸
     * 基类统一管理，子类不需要处理
     */
    protected _updateCanvasSize(): void;
    /**
     * 初始化 UI 视口
     * 根据横竖屏选择不同的逻辑分辨率
     */
    _initUIViewport(): void;
    /**
     * 更新 UI 视口方向
     * 横竖屏切换时调用，动态调整 world 尺寸
     */
    _updateViewportOrientation(): void;
    _initWorldCamera(): void;
    init(): void;
    enter(): void;
    exit(): void;
    render(delta: number): void;
    /**
     * resize 回调（子类可覆盖）
     * 基类已经处理了 Viewport 和 canvas 尺寸更新
     * 子类只需要处理自己的特殊逻辑
     */
    onResize(): void;
    /**
     * 内部 resize 处理
     * 统一处理 Viewport、canvas、世界相机的更新
     */
    private _onResize;
    /**
     * 强制 resize（供外部调用，如工具条全屏切换）
     * 参考原版 GScreen.resize()
     */
    resize(): void;
    handleBack(): boolean;
    destroy(): void;
}
