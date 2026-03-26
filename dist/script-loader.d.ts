/**
 * 脚本加载器
 * 动态加载 JS 文件，支持进度回调
 */
declare class ScriptLoader {
    cacheBuster: any;
    /**
     * 加载单个脚本
     * @param {string} src - 脚本路径
     * @param {boolean} useCache - 是否使用缓存（CDN文件用缓存）
     * @returns {Promise}
     */
    loadOne(src: string, useCache?: boolean): Promise<any>;
    /**
     * 批量加载脚本，带进度回调
     * @param {Array} scripts - 脚本配置数组 [{name, src, weight, useCache}]
     * @param {Function} onProgress - 进度回调 (percent, status)
     * @returns {Promise}
     */
    loadBatch(scripts: any[], onProgress: Function): Promise<any>;
}
declare namespace SCRIPT_GROUPS {
    let ui: {
        name: string;
        src: string;
        weight: number;
    }[];
    let logger: {
        name: string;
        src: string;
        weight: number;
    }[];
    let toolbar: {
        name: string;
        src: string;
        weight: number;
    }[];
    let webgpuDemo: {
        name: string;
        src: string;
        weight: number;
    }[];
    let screen: {
        name: string;
        src: string;
        weight: number;
    }[];
    let screens: {
        name: string;
        src: string;
        weight: number;
    }[];
}
