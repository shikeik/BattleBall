/**
 * 日志核心 - 纯数据逻辑，无 DOM 操作
 */
declare class LoggerCore {
    constructor(config?: {
        maxLogs: number;
        panel: {
            maxHeight: number;
            filterHeight: number;
        };
        tags: {
            ALL: {
                label: string;
                subs: string[];
                color: string;
            };
            ERROR: {
                label: string;
                subs: string[];
                color: string;
            };
            TMP: {
                label: string;
                subs: string[];
                color: string;
            };
            game: {
                label: string;
                subs: string[];
                color: string;
            };
            render: {
                label: string;
                subs: string[];
                color: string;
            };
            input: {
                label: string;
                subs: string[];
                color: string;
            };
            audio: {
                label: string;
                subs: string[];
                color: string;
            };
            perf: {
                label: string;
                subs: string[];
                color: string;
            };
            module: {
                label: string;
                subs: string[];
                color: string;
            };
            AUDIO: {
                label: string;
                subs: string[];
                color: string;
            };
            DIFFICULTY: {
                label: string;
                subs: string[];
                color: string;
            };
            GAME: {
                label: string;
                subs: string[];
                color: string;
            };
            INPUT: {
                label: string;
                subs: string[];
                color: string;
            };
            PERF: {
                label: string;
                subs: string[];
                color: string;
            };
            UI: {
                label: string;
                subs: string[];
                color: string;
            };
            system: {
                label: string;
                subs: string[];
                color: string;
            };
        };
        storageKey: string;
        assignColor: typeof assignColor;
    });
    config: {
        maxLogs: number;
        panel: {
            maxHeight: number;
            filterHeight: number;
        };
        tags: {
            ALL: {
                label: string;
                subs: string[];
                color: string;
            };
            ERROR: {
                label: string;
                subs: string[];
                color: string;
            };
            TMP: {
                label: string;
                subs: string[];
                color: string;
            };
            game: {
                label: string;
                subs: string[];
                color: string;
            };
            render: {
                label: string;
                subs: string[];
                color: string;
            };
            input: {
                label: string;
                subs: string[];
                color: string;
            };
            audio: {
                label: string;
                subs: string[];
                color: string;
            };
            perf: {
                label: string;
                subs: string[];
                color: string;
            };
            module: {
                label: string;
                subs: string[];
                color: string;
            };
            AUDIO: {
                label: string;
                subs: string[];
                color: string;
            };
            DIFFICULTY: {
                label: string;
                subs: string[];
                color: string;
            };
            GAME: {
                label: string;
                subs: string[];
                color: string;
            };
            INPUT: {
                label: string;
                subs: string[];
                color: string;
            };
            PERF: {
                label: string;
                subs: string[];
                color: string;
            };
            UI: {
                label: string;
                subs: string[];
                color: string;
            };
            system: {
                label: string;
                subs: string[];
                color: string;
            };
        };
        storageKey: string;
        assignColor: typeof assignColor;
    };
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
        ALL: {
            label: string;
            subs: string[];
            color: string;
        };
        ERROR: {
            label: string;
            subs: string[];
            color: string;
        };
        TMP: {
            label: string;
            subs: string[];
            color: string;
        };
        game: {
            label: string;
            subs: string[];
            color: string;
        };
        render: {
            label: string;
            subs: string[];
            color: string;
        };
        input: {
            label: string;
            subs: string[];
            color: string;
        };
        audio: {
            label: string;
            subs: string[];
            color: string;
        };
        perf: {
            label: string;
            subs: string[];
            color: string;
        };
        module: {
            label: string;
            subs: string[];
            color: string;
        };
        AUDIO: {
            label: string;
            subs: string[];
            color: string;
        };
        DIFFICULTY: {
            label: string;
            subs: string[];
            color: string;
        };
        GAME: {
            label: string;
            subs: string[];
            color: string;
        };
        INPUT: {
            label: string;
            subs: string[];
            color: string;
        };
        PERF: {
            label: string;
            subs: string[];
            color: string;
        };
        UI: {
            label: string;
            subs: string[];
            color: string;
        };
        system: {
            label: string;
            subs: string[];
            color: string;
        };
    };
}
