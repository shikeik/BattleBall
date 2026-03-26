/**
 * 顶部工具栏 - 分页管理版
 * 支持多页工具菜单，横向滑动翻页
 */
declare class Toolbar {
    currentPage: number;
    totalPages: number;
    buttonsPerPage: number;
    allButtons: any[];
    container: HTMLDivElement | null;
    pageIndicator: HTMLDivElement | null;
    touchStartX: number;
    isDragging: boolean;
    dragOffset: number;
    init(): void;
    createContainer(): void;
    track: HTMLDivElement | undefined;
    createPageIndicator(): void;
    updatePageIndicator(): void;
    registerDefaultButtons(): void;
    fillEmptySlots(): void;
    registerButton(config: any): {
        id: any;
        icon: any;
        page: any;
        indexInPage: any;
        onClick: any;
        element: null;
    };
    getNextSlotIndex(page: any): number;
    renderAllPages(): void;
    createButtonElement(button: any): HTMLDivElement;
    updateSlidePosition(): void;
    bindEvents(): void;
    nextPage(): void;
    prevPage(): void;
    goToPage(page: any): void;
    goBack(): void;
    toggleFullscreen(): Promise<void>;
    toggleSettings(): void;
    toggleDebugPanel(): void;
    createSettingsPanel(): void;
    createDebugPanel(): void;
    updateLogButton(isOpen: any): void;
    addToolButton(config: any): {
        id: any;
        icon: any;
        page: any;
        indexInPage: any;
        onClick: any;
        element: null;
    };
    findAvailableSlot(): {
        page: number;
        index: number;
    };
    removeButton(id: any): boolean;
    getButton(id: any): any;
    setTotalPages(count: any): void;
}
