/**
 * Joystick - 虚拟摇杆
 * 用于控制玩家移动
 */
declare class Joystick {
    constructor(options?: {});
    canvas: any;
    radius: any;
    innerRadius: any;
    position: any;
    bottomOffset: any;
    active: boolean;
    touchId: any;
    centerX: number;
    centerY: number;
    dx: number;
    dy: number;
    onMove: any;
    onEnd: any;
    /**
     * 绑定触摸/鼠标事件
     */
    _bindEvents(): void;
    /**
     * 获取摇杆中心位置（屏幕坐标）
     */
    _getCenter(screenWidth: any, screenHeight: any): {
        x: any;
        y: number;
    };
    /**
     * 处理触摸开始
     */
    _onTouchStart(e: any): void;
    /**
     * 处理触摸移动
     */
    _onTouchMove(e: any): void;
    /**
     * 处理触摸结束
     */
    _onTouchEnd(e: any): void;
    /**
     * 鼠标事件处理
     */
    _onMouseDown(e: any): void;
    _onMouseMove(e: any): void;
    _onMouseUp(e: any): void;
    /**
     * 更新摇杆位置
     */
    _updatePosition(x: any, y: any): void;
    /**
     * 重置摇杆
     */
    _reset(): void;
    /**
     * 绘制摇杆
     */
    render(ctx: any, screenWidth: any, screenHeight: any): void;
    /**
     * 销毁
     */
    destroy(): void;
}
