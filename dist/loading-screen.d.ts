/**
 * 加载场景管理器
 * 负责所有系统初始化，显示加载进度，完成后自动转场
 */
declare class LoadingScreen {
    container: HTMLDivElement | null;
    progressBar: HTMLElement | null;
    progressText: HTMLElement | null;
    statusText: HTMLElement | null;
    onComplete: any;
    initTasks: any[];
    currentTask: number;
    /**
     * 创建加载界面
     */
    create(): void;
    /**
     * 注册初始化任务
     * @param {string} name - 任务名称
     * @param {Function} task - 异步任务函数
     * @param {number} weight - 任务权重（占总进度的比例）
     */
    registerTask(name: string, task: Function, weight?: number): void;
    /**
     * 更新进度显示
     */
    updateProgress(percent: any, status: any): void;
    /**
     * 执行所有初始化任务
     */
    start(): Promise<void>;
    /**
     * 加载完成，转场到开始界面
     */
    complete(): void;
}
