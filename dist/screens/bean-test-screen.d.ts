/**
 * BeanTestScreen - 彩豆渲染测试场景
 * 最简单的测试：只渲染2万个彩豆
 */
declare class BeanTestScreen extends Screen {
    init(): void;
    beanManager: BeanManager | null | undefined;
    initialized: boolean | undefined;
    enter(): Promise<void>;
    _startRenderLoop(): void;
    _render(): void;
    exit(): void;
    handleBack(): any;
}
