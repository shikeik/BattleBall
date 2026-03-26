/**
 * 日志 UI - 纯 DOM 操作，依赖 LoggerCore
 */
declare class LoggerUI {
    constructor(core: any);
    core: any;
    visible: boolean;
    autoScroll: boolean;
    panel: HTMLDivElement | null;
    tab: any;
    logArea: HTMLDivElement | null;
    filterPanel: HTMLDivElement | null;
    init(): void;
    createPanel(): void;
    renderFilters(): void;
    bindEvents(): void;
    bindCoreEvents(): void;
    displayLog(log: any): void;
    refreshLogs(): void;
    saveLogs(): void;
    toggle(): void;
    show(): void;
    hide(): void;
}
