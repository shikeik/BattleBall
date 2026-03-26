// 全局类型声明

declare interface Logger {
	log(tag: string, message: string, data?: any): void;
}

declare interface Toolbar {
	addToolButton(config: {
		id: string;
		icon: string;
		page: number;
		onClick: () => void;
	}): void;
}

declare global {
	interface Window {
		logger: Logger;
		Toolbar: new () => Toolbar;
		toolbar: Toolbar;
		screenManager: ScreenManager;
		BUILD_VERSION: string;
		CACHE_BUSTER: number;
		
		// Screen 类
		Screen: typeof Screen;
		SelectionScreen: typeof SelectionScreen;
		MenuScreen: typeof MenuScreen;
		GameScreen: typeof GameScreen;
		SettingsScreen: typeof SettingsScreen;
		WebGPUScreen: typeof WebGPUScreen;
		BattleBallScreen: typeof BattleBallScreen;
		
		// Viewport
		Viewport: typeof Viewport;
		createViewport: (shortSide: number, longSide: number, isLandscape: boolean) => Viewport;
		
		// WebGPU
		WebGPUDemo: typeof WebGPUDemo;
	}
}

export {};
