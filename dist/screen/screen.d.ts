/**
 * Screen 基类
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
    constructor(screenManager?: any);
    initialize(): void;
    _updateScreenSize(): void;
    _initUIViewport(): void;
    _initWorldCamera(): void;
    init(): void;
    enter(): void;
    exit(): void;
    render(delta: number): void;
    resize(): void;
    handleBack(): boolean;
    destroy(): void;
}
