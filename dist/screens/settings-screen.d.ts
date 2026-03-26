/**
 * SettingsScreen - 设置界面
 */
declare class SettingsScreen extends Screen {
    init(): void;
    canvas: HTMLElement | null | undefined;
    settings: {
        name: string;
        label: string;
        value: boolean;
    }[] | undefined;
    hoveredIndex: any;
    enter(): void;
    exit(): void;
    render(delta: any): void;
    _renderBackButton(ctx: any, w: any, y: any): void;
    toggleSetting(index: any): void;
    handleBack(): boolean;
    _bindEvents(): void;
    _onMouseMove: ((e: any) => void) | undefined;
    _onClick: ((e: any) => void) | undefined;
    _unbindEvents(): void;
}
