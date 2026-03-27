/**
 * 日志核心 - 纯数据逻辑，无 DOM 操作
 */
declare class LoggerCore {
    constructor(config?: typeof LOGGER_CONFIG);
    config: typeof LOGGER_CONFIG;
    logs: any[];
    activeTags: string[];
    listeners: any[];
    loadActiveTags(): string[];
    isTagActive(fullTag: any): boolean;
    toggleTag(tag: any, checked: any): void;
    saveTags(): void;
    log(tag: any, msg: any, data: any): {
        time: string;
        tag: any;
        msg: any;
        data: any;
        line: string;
    };
    getFilteredLogs(): any[];
    clear(): void;
    getAllLogs(): string;
    on(event: any, callback: any): void;
    notify(event: any, data: any): void;
    getTagConfig(tag: any): any;
    getAllTags(): {
        ALL: typeof DEFAULT_LOG_TAGS.ALL;
        ERROR: typeof DEFAULT_LOG_TAGS.ERROR;
        TMP: typeof DEFAULT_LOG_TAGS.TMP;
        game: typeof DEFAULT_LOG_TAGS.game;
        render: typeof DEFAULT_LOG_TAGS.render;
        input: typeof DEFAULT_LOG_TAGS.input;
        audio: typeof DEFAULT_LOG_TAGS.audio;
        perf: typeof DEFAULT_LOG_TAGS.perf;
        module: typeof DEFAULT_LOG_TAGS.module;
        AUDIO: typeof DEFAULT_LOG_TAGS.AUDIO;
        DIFFICULTY: typeof DEFAULT_LOG_TAGS.DIFFICULTY;
        GAME: typeof DEFAULT_LOG_TAGS.GAME;
        INPUT: typeof DEFAULT_LOG_TAGS.INPUT;
        PERF: typeof DEFAULT_LOG_TAGS.PERF;
        UI: typeof DEFAULT_LOG_TAGS.UI;
        system: typeof DEFAULT_LOG_TAGS.system;
    };
}
