declare namespace UILayers {
    let GAME: number;
    let WORLD_UI: number;
    let HUD: number;
    let WEAPON: number;
    let CONTROLS: number;
    let PANEL: number;
    let START_SCREEN: number;
    let SHIP_VIEWER: number;
    let GAME_OVER: number;
    let DEBUG: number;
    let TOOLBAR: number;
    /**
     * 获取指定层级之上的层级
     * @param {number} baseLayer - 基础层级
     * @param {number} offset - 偏移量（默认1）
     * @returns {number} 计算后的层级
     */
    function getAbove(baseLayer: number, offset?: number): number;
    /**
     * 获取指定层级之下的层级
     * @param {number} baseLayer - 基础层级
     * @param {number} offset - 偏移量（默认1）
     * @returns {number} 计算后的层级
     */
    function getBelow(baseLayer: number, offset?: number): number;
    /**
     * 应用层级到DOM元素
     * @param {HTMLElement} element - 目标元素
     * @param {number} layer - 层级值
     */
    function apply(element: HTMLElement, layer: number): void;
    /**
     * 批量应用CSS变量到根元素
     * 在初始化时调用一次
     */
    function initCSSVariables(): void;
    /**
     * 获取层级的文字描述（用于调试）
     * @param {number} layer - 层级值
     * @returns {string} 层级名称
     */
    function getName(layer: number): string;
    /**
     * 打印当前所有层级的信息（调试用）
     */
    function debug(): void;
}
