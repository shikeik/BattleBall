// 全局类型声明

// ==================== Window 扩展 ====================

declare global {
	interface Window {
		// 核心类
		LoadingScreen: typeof import('./loading-screen').default;
		ScriptLoader: typeof import('./script-loader').default;
		Toolbar: typeof import('./toolbar').default;
		PerfMonitor: typeof import('./perf-monitor').default;
		UILayers: typeof import('./ui/layers').default;
		
		// 屏幕系统
		Screen: any;
		GScreen: any;
		Viewport: any;
		ScreenManager: any;
		
		// 日志系统
		Logger: typeof import('./logger/index').default;
		LoggerCore: typeof import('./logger/core').default;
		LoggerUI: typeof import('./logger/ui').default;
		LOGGER_CONFIG: any;
		DEFAULT_LOG_TAGS: any;
		setLoggerConfig: (config: any) => void;
		getRuntimeTags: () => string[];
		
		// 全局实例
		logger?: {
			log: (tag: string, message: string, data?: any) => void;
			toggle?: () => void;
			core?: any;
			ui?: any;
		};
		tempPerfMonitor?: any;
		game?: any;
		toolbar: InstanceType<typeof import('./toolbar').default>;
		screenManager: InstanceType<typeof import('./screen/screen-manager').default>;
		
		// 缓存
		CACHE_BUSTER: number;
		BUILD_VERSION: string;
		
		// 脚本分组
		SCRIPT_GROUPS: Record<string, Array<{name: string; src: string; weight?: number; useCache?: boolean}>>;
		ScriptLoader: typeof import('./script-loader').default;
		
		// 屏幕
		MenuScreen: typeof import('./screens/menu-screen').default;
		SceneA: typeof import('./screens/menu-screen').SceneA;
		SceneB: typeof import('./screens/menu-screen').SceneB;
	}
	
	// Logger 接口
	interface Logger {
		log(tag: string, message: string, data?: any): void;
		toggle?(): void;
		clear?(): void;
		getAllLogs?(): string;
		on?(event: string, callback: (...args: any[]) => void): void;
	}
	
	// 性能内存接口
	interface MemoryInfo {
		usedJSHeapSize: number;
		totalJSHeapSize: number;
		jsHeapSizeLimit: number;
	}
	
	interface Performance {
		memory?: MemoryInfo;
	}
	
	// Navigator GPU
	interface Navigator {
		gpu?: GPU;
	}
	
	interface GPU {
		requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
	}
	
	interface GPUAdapter {
		requestDevice(): Promise<GPUDevice>;
	}
	
	interface GPUDevice {
		queue: GPUQueue;
	}
	
	interface GPUQueue {
		submit(commandBuffers: any[]): void;
	}
	
	interface GPURequestAdapterOptions {
		powerPreference?: 'low-power' | 'high-performance';
	}
}

// 确保此文件被视为模块
export {};
