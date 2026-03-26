/**
 * WebGPUScreen - WebGPU 演示界面
 */
declare class WebGPUScreen extends Screen {
    init(): void;
    canvas: HTMLElement | null | undefined;
    webgpuDemo: WebGPUDemo | null | undefined;
    initializing: boolean | undefined;
    error: any;
    enter(): void;
    exit(): void;
    webgpuCanvas: HTMLCanvasElement | null | undefined;
    _initWebGPU(): Promise<void>;
    render(delta: any): void;
    _renderError(): void;
    _renderLoading(): void;
    _renderUI(): void;
    handleBack(): boolean;
}
