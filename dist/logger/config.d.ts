declare function assignColor(tagName: any, index: any): any;
declare namespace DEFAULT_LOG_TAGS {
    namespace ALL {
        let label: string;
        let subs: string[];
        let color: string;
    }
    namespace ERROR {
        let label_1: string;
        export { label_1 as label };
        let subs_1: string[];
        export { subs_1 as subs };
        let color_1: string;
        export { color_1 as color };
    }
    namespace TMP {
        let label_2: string;
        export { label_2 as label };
        let subs_2: string[];
        export { subs_2 as subs };
        let color_2: string;
        export { color_2 as color };
    }
    namespace game {
        let label_3: string;
        export { label_3 as label };
        let subs_3: string[];
        export { subs_3 as subs };
        let color_3: string;
        export { color_3 as color };
    }
    namespace render {
        let label_4: string;
        export { label_4 as label };
        let subs_4: string[];
        export { subs_4 as subs };
        let color_4: string;
        export { color_4 as color };
    }
    namespace input {
        let label_5: string;
        export { label_5 as label };
        let subs_5: string[];
        export { subs_5 as subs };
        let color_5: string;
        export { color_5 as color };
    }
    namespace audio {
        let label_6: string;
        export { label_6 as label };
        let subs_6: string[];
        export { subs_6 as subs };
        let color_6: string;
        export { color_6 as color };
    }
    namespace perf {
        let label_7: string;
        export { label_7 as label };
        let subs_7: string[];
        export { subs_7 as subs };
        let color_7: string;
        export { color_7 as color };
    }
    namespace module {
        let label_8: string;
        export { label_8 as label };
        let subs_8: string[];
        export { subs_8 as subs };
        let color_8: string;
        export { color_8 as color };
    }
    namespace AUDIO {
        let label_9: string;
        export { label_9 as label };
        let subs_9: string[];
        export { subs_9 as subs };
        let color_9: string;
        export { color_9 as color };
    }
    namespace DIFFICULTY {
        let label_10: string;
        export { label_10 as label };
        let subs_10: string[];
        export { subs_10 as subs };
        let color_10: string;
        export { color_10 as color };
    }
    namespace GAME {
        let label_11: string;
        export { label_11 as label };
        let subs_11: string[];
        export { subs_11 as subs };
        let color_11: string;
        export { color_11 as color };
    }
    namespace INPUT {
        let label_12: string;
        export { label_12 as label };
        let subs_12: string[];
        export { subs_12 as subs };
        let color_12: string;
        export { color_12 as color };
    }
    namespace PERF {
        let label_13: string;
        export { label_13 as label };
        let subs_13: string[];
        export { subs_13 as subs };
        let color_13: string;
        export { color_13 as color };
    }
    namespace UI {
        let label_14: string;
        export { label_14 as label };
        let subs_14: string[];
        export { subs_14 as subs };
        let color_14: string;
        export { color_14 as color };
    }
    namespace system {
        let label_15: string;
        export { label_15 as label };
        let subs_15: string[];
        export { subs_15 as subs };
        let color_15: string;
        export { color_15 as color };
    }
}
declare const COLOR_PALETTE: string[];
declare namespace LOGGER_CONFIG {
    export let maxLogs: number;
    export namespace panel {
        let maxHeight: number;
        let filterHeight: number;
    }
    export { DEFAULT_LOG_TAGS as tags };
    export let storageKey: string;
    export { assignColor };
}
declare const RUNTIME_TAGS: Set<string>;
