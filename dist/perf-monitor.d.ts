/**
 * 性能监控器 - 简化版
 * 实时显示 FPS
 */
declare class PerfMonitor {
    enabled: boolean;
    frameCount: number;
    lastTime: number;
    fps: number;
    panel: HTMLDivElement | null;
    createPanel(): void;
    bindToggle(): void;
    updateLoop(): void;
    toggle(): void;
}
