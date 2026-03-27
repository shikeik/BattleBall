/**
 * MenuScreen - 主菜单界面
 * 原版用法：填充 screenMapping，null 作为分隔线
 */
declare class MenuScreen extends SelectionScreen {
    initScreenMapping(map: any): void;
}
declare class GameScreen extends Screen {
    init(): void;
    canvas: HTMLElement | null | undefined;
    enter(): void;
    exit(): void;
    render(delta: any): void;
    _handleClick(): void;
    _bindEvents(): void;
    _onClick: (() => void) | undefined;
    _unbindEvents(): void;
    handleBack(): any;
}
