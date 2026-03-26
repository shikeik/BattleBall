/**
 * SelectionScreen - 选择屏基类
 * 原版逻辑：使用 Map 映射，null 值作为分隔线，全部触发 replace
 */
declare class SelectionScreen extends Screen {
    constructor(screenManager: any);
    screenMapping: Map<any, any>;
    canvas: HTMLElement | null;
    hoveredIndex: number;
    buttons: any[];
    init(): void;
    /**
     * 子类必须实现：填充屏幕映射
     * 使用示例：
     *   map.set('开始游戏', GameScreen);
     *   map.set('分隔标题', null);  // null 作为分隔线
     *   map.set('设置', SettingsScreen);
     */
    initScreenMapping(map: any): void;
    enter(): void;
    exit(): void;
    render(delta: any): void;
    _drawButtons(ctx: any, w: any, h: any): void;
    /**
     * 屏幕选择回调（子类可重写拦截）
     * 默认行为：replaceScreen
     */
    onScreenSelected(screenClass: any): void;
    _bindEvents(): void;
    _onMouseMove: ((e: any) => void) | undefined;
    _onClick: ((e: any) => void) | undefined;
    _onTouchStart: ((e: any) => void) | undefined;
    _onTouchEnd: ((e: any) => void) | undefined;
    _unbindEvents(): void;
}
