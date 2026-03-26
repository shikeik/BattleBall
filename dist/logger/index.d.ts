/**
 * 日志系统入口
 * 组合 LoggerCore + LoggerUI
 */
declare class Logger {
    core: LoggerCore;
    ui: LoggerUI;
    log(tag: any, msg: any, data: any): {
        time: string;
        tag: any;
        msg: any;
        data: any;
        line: string;
    };
    clear(): void;
    show(): void;
    hide(): void;
    toggle(): void;
    addTag(key: any, config: any): void;
    removeTag(key: any): void;
}
