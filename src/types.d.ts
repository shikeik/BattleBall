// 全局类型声明

// ==================== WebGPU 类型声明 ====================

interface GPU {
	requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
	getPreferredCanvasFormat(): GPUTextureFormat;
}

interface GPURequestAdapterOptions {
	powerPreference?: 'low-power' | 'high-performance';
	forceFallbackAdapter?: boolean;
}

interface GPUAdapter {
	requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
	features: GPUFeatureList;
	limits: GPULimits;
}

interface GPUDeviceDescriptor {
	requiredFeatures?: string[];
	requiredLimits?: GPULimits;
}

interface GPUDevice extends EventTarget {
	createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
	createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
	createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
	createRenderPipelineAsync(descriptor: GPURenderPipelineDescriptor): Promise<GPURenderPipeline>;
	createComputePipeline(descriptor: any): any;
	createComputePipelineAsync(descriptor: any): Promise<any>;
	createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
	createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout;
	createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
	createCommandEncoder(): GPUCommandEncoder;
	createTexture(descriptor: GPUTextureDescriptor): GPUTexture;
	createSampler(descriptor?: GPUSamplerDescriptor): GPUSampler;
	createQuerySet(descriptor: any): any;
	createRenderBundleEncoder(descriptor: any): any;
	queue: GPUQueue;
	lost: Promise<GPUDeviceLostInfo>;
	destroy(): void;
	adapterInfo: any;
	features: GPUFeatureList;
	limits: GPULimits;
	onuncapturederror: ((this: GPUDevice, ev: GPUUncapturedErrorEvent) => any) | null;
	label?: string;
}

interface GPUUncapturedErrorEvent extends Event {
	error: GPUError;
}

interface GPUError {
	message: string;
}

interface GPUDeviceLostInfo {
	reason: 'destroyed' | 'unknown';
	message: string;
}

interface GPUBufferDescriptor {
	size: number;
	usage: number;
	mappedAtCreation?: boolean;
}

interface GPUBuffer {
	getMappedRange(offset?: number, size?: number): ArrayBuffer;
	unmap(): void;
	destroy(): void;
}

interface GPUBufferUsageStatic {
	readonly MAP_READ: number;
	readonly MAP_WRITE: number;
	readonly COPY_SRC: number;
	readonly COPY_DST: number;
	readonly INDEX: number;
	readonly VERTEX: number;
	readonly UNIFORM: number;
	readonly STORAGE: number;
	readonly INDIRECT: number;
	readonly QUERY_RESOLVE: number;
}

interface GPUShaderModuleDescriptor {
	code: string;
	label?: string;
}

interface GPUShaderModule {
	label?: string;
}

interface GPURenderPipeline {
	label?: string;
}

interface GPUBindGroupDescriptor {
	layout: GPUBindGroupLayout;
	entries: GPUBindGroupEntry[];
	label?: string;
}

interface GPUBindGroup {
	label?: string;
}

interface GPUBindGroupEntry {
	binding: number;
	resource: GPUBindingResource;
}

type GPUBindingResource = GPUSampler | GPUTextureView | GPUBufferBinding;

interface GPUBufferBinding {
	buffer: GPUBuffer;
	offset?: number;
	size?: number;
}

interface GPUBindGroupLayoutDescriptor {
	entries: GPUBindGroupLayoutEntry[];
	label?: string;
}

interface GPUBindGroupLayout {
	label?: string;
}

interface GPUBindGroupLayoutEntry {
	binding: number;
	visibility: number;
	sampler?: GPUSamplerBindingLayout;
	texture?: GPUTextureBindingLayout;
	buffer?: GPUBufferBindingLayout;
}

interface GPUSamplerBindingLayout {
	type?: 'filtering' | 'non-filtering' | 'comparison';
}

interface GPUTextureBindingLayout {
	sampleType?: 'float' | 'unfilterable-float' | 'depth' | 'sint' | 'uint';
	viewDimension?: '1d' | '2d' | '2d-array' | 'cube' | 'cube-array' | '3d';
	multisampled?: boolean;
}

interface GPUBufferBindingLayout {
	type?: 'uniform' | 'storage' | 'read-only-storage';
	hasDynamicOffset?: boolean;
	minBindingSize?: number;
}

interface GPUPipelineLayoutDescriptor {
	bindGroupLayouts: (GPUBindGroupLayout | null)[];
	label?: string;
}

interface GPUPipelineLayout {
	label?: string;
}

interface GPURenderPipelineDescriptor {
	layout: GPUPipelineLayout | 'auto';
	vertex: GPUVertexState;
	fragment?: GPUFragmentState;
	primitive?: GPUPrimitiveState;
	depthStencil?: GPUDepthStencilState;
	multisample?: GPUMultisampleState;
	label?: string;
}

interface GPUVertexState {
	module: GPUShaderModule;
	entryPoint: string;
	buffers?: GPUVertexBufferLayout[];
	constants?: Record<string, number>;
}

interface GPUVertexBufferLayout {
	arrayStride: number;
	stepMode?: 'vertex' | 'instance';
	attributes: GPUVertexAttribute[];
}

interface GPUVertexAttribute {
	format: GPUVertexFormat;
	offset: number;
	shaderLocation: number;
}

type GPUVertexFormat = 
	| 'uint8x2' | 'uint8x4' | 'sint8x2' | 'sint8x4' | 'unorm8x2' | 'unorm8x4' | 'snorm8x2' | 'snorm8x4'
	| 'uint16x2' | 'uint16x4' | 'sint16x2' | 'sint16x4' | 'unorm16x2' | 'unorm16x4' | 'snorm16x2' | 'snorm16x4'
	| 'float16x2' | 'float16x4' | 'float32' | 'float32x2' | 'float32x3' | 'float32x4'
	| 'uint32' | 'uint32x2' | 'uint32x3' | 'uint32x4' | 'sint32' | 'sint32x2' | 'sint32x3' | 'sint32x4';

interface GPUFragmentState {
	module: GPUShaderModule;
	entryPoint: string;
	targets: GPUColorTargetState[];
	constants?: Record<string, number>;
}

interface GPUColorTargetState {
	format: GPUTextureFormat;
	blend?: GPUBlendState;
	writeMask?: number;
}

interface GPUBlendState {
	color: GPUBlendComponent;
	alpha: GPUBlendComponent;
}

interface GPUBlendComponent {
	operation?: 'add' | 'subtract' | 'reverse-subtract' | 'min' | 'max';
	srcFactor?: 'zero' | 'one' | 'src' | 'one-minus-src' | 'src-alpha' | 'one-minus-src-alpha' | 'dst' | 'one-minus-dst' | 'dst-alpha' | 'one-minus-dst-alpha' | 'src-alpha-saturated' | 'constant' | 'one-minus-constant';
	dstFactor?: 'zero' | 'one' | 'src' | 'one-minus-src' | 'src-alpha' | 'one-minus-src-alpha' | 'dst' | 'one-minus-dst' | 'dst-alpha' | 'one-minus-dst-alpha' | 'src-alpha-saturated' | 'constant' | 'one-minus-constant';
}

interface GPUPrimitiveState {
	topology?: 'point-list' | 'line-list' | 'line-strip' | 'triangle-list' | 'triangle-strip';
	stripIndexFormat?: 'uint16' | 'uint32';
	frontFace?: 'ccw' | 'cw';
	cullMode?: 'none' | 'front' | 'back';
}

interface GPUDepthStencilState {
	format: GPUTextureFormat;
	depthWriteEnabled?: boolean;
	depthCompare?: GPUCompareFunction;
}

type GPUCompareFunction = 'never' | 'less' | 'equal' | 'less-equal' | 'greater' | 'not-equal' | 'greater-equal' | 'always';

interface GPUMultisampleState {
	count?: number;
	mask?: number;
	alphaToCoverageEnabled?: boolean;
}

interface GPUCanvasContext {
	configure(configuration: GPUCanvasConfiguration): void;
	getCurrentTexture(): GPUTexture;
	unconfigure(): void;
	canvas: HTMLCanvasElement;
	getConfiguration(): GPUCanvasConfiguration | null;
}

interface GPUCanvasConfiguration {
	device: GPUDevice;
	format: GPUTextureFormat;
	usage?: number;
	viewFormats?: GPUTextureFormat[];
	colorSpace?: 'srgb' | 'display-p3';
	alphaMode?: 'opaque' | 'premultiplied';
}

interface GPUCommandEncoder {
	beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
	beginComputePass(descriptor?: GPUComputePassDescriptor): GPUComputePassEncoder;
	copyBufferToBuffer(source: GPUBuffer, sourceOffset: number, destination: GPUBuffer, destinationOffset: number, size: number): void;
	finish(): GPUCommandBuffer;
	label?: string;
}

interface GPURenderPassDescriptor {
	colorAttachments: GPURenderPassColorAttachment[];
	depthStencilAttachment?: GPURenderPassDepthStencilAttachment;
}

interface GPURenderPassColorAttachment {
	view: GPUTextureView;
	resolveTarget?: GPUTextureView;
	clearValue?: GPUColor;
	loadOp: 'load' | 'clear';
	storeOp: 'store' | 'discard';
}

type GPUColor = [number, number, number, number] | { r: number; g: number; b: number; a: number };

interface GPURenderPassDepthStencilAttachment {
	view: GPUTextureView;
	depthClearValue?: number;
	depthLoadOp?: 'load' | 'clear';
	depthStoreOp?: 'store' | 'discard';
	depthReadOnly?: boolean;
}

interface GPURenderPassEncoder {
	setPipeline(pipeline: GPURenderPipeline): void;
	setBindGroup(index: number, bindGroup: GPUBindGroup | null, dynamicOffsets?: number[]): void;
	setVertexBuffer(slot: number, buffer: GPUBuffer | null, offset?: number, size?: number): void;
	setIndexBuffer(buffer: GPUBuffer, indexFormat: 'uint16' | 'uint32', offset?: number, size?: number): void;
	draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
	drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void;
	end(): void;
	label?: string;
}

interface GPUComputePassDescriptor {
	label?: string;
}

interface GPUComputePassEncoder {
	setPipeline(pipeline: GPUComputePipeline): void;
	setBindGroup(index: number, bindGroup: GPUBindGroup | null, dynamicOffsets?: number[]): void;
	dispatchWorkgroups(x: number, y?: number, z?: number): void;
	end(): void;
	label?: string;
}

interface GPUComputePipeline {
	label?: string;
}

interface GPUCommandBuffer {
	label?: string;
}

interface GPUQueue {
	submit(commandBuffers: GPUCommandBuffer[]): void;
	writeBuffer(buffer: GPUBuffer, bufferOffset: number, data: ArrayBufferView | ArrayBuffer, dataOffset?: number, size?: number): void;
}

interface GPUTextureDescriptor {
	size: GPUExtent3D;
	format: GPUTextureFormat;
	usage: number;
	mipLevelCount?: number;
	sampleCount?: number;
	dimension?: '1d' | '2d' | '3d';
	viewFormats?: GPUTextureFormat[];
	label?: string;
}

type GPUExtent3D = [number, number?, number?] | { width: number; height?: number; depthOrArrayLayers?: number };

interface GPUTexture {
	createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView;
	destroy(): void;
	label?: string;
}

interface GPUTextureViewDescriptor {
	format?: GPUTextureFormat;
	dimension?: '1d' | '2d' | '2d-array' | 'cube' | 'cube-array' | '3d';
	aspect?: 'all' | 'stencil-only' | 'depth-only';
	baseMipLevel?: number;
	mipLevelCount?: number;
	baseArrayLayer?: number;
	arrayLayerCount?: number;
	label?: string;
}

interface GPUTextureView {
	label?: string;
}

type GPUTextureFormat = 
	| 'r8unorm' | 'r8snorm' | 'r8uint' | 'r8sint'
	| 'r16uint' | 'r16sint' | 'r16float' | 'rg8unorm' | 'rg8snorm' | 'rg8uint' | 'rg8sint'
	| 'r32uint' | 'r32sint' | 'r32float' | 'rg16uint' | 'rg16sint' | 'rg16float' | 'rgba8unorm' | 'rgba8unorm-srgb' | 'rgba8snorm' | 'rgba8uint' | 'rgba8sint' | 'bgra8unorm' | 'bgra8unorm-srgb'
	| 'rgb10a2unorm' | 'rg11b10ufloat' | 'rgb9e5ufloat'
	| 'rg32uint' | 'rg32sint' | 'rg32float' | 'rgba16uint' | 'rgba16sint' | 'rgba16float'
	| 'rgba32uint' | 'rgba32sint' | 'rgba32float'
	| 'stencil8' | 'depth16unorm' | 'depth24plus' | 'depth24plus-stencil8' | 'depth32float' | 'depth32float-stencil8';

declare const GPUTextureUsage: {
	readonly COPY_SRC: number;
	readonly COPY_DST: number;
	readonly TEXTURE_BINDING: number;
	readonly STORAGE_BINDING: number;
	readonly RENDER_ATTACHMENT: number;
};

interface GPUSamplerDescriptor {
	addressModeU?: 'clamp-to-edge' | 'repeat' | 'mirror-repeat';
	addressModeV?: 'clamp-to-edge' | 'repeat' | 'mirror-repeat';
	addressModeW?: 'clamp-to-edge' | 'repeat' | 'mirror-repeat';
	magFilter?: 'nearest' | 'linear';
	minFilter?: 'nearest' | 'linear';
	mipmapFilter?: 'nearest' | 'linear';
	lodMinClamp?: number;
	lodMaxClamp?: number;
	compare?: GPUCompareFunction;
	maxAnisotropy?: number;
	label?: string;
}

interface GPUSampler {
	label?: string;
}

interface GPUFeatureList extends Iterable<string> {
	has(feature: string): boolean;
}

interface GPULimits {
	maxTextureDimension1D?: number;
	maxTextureDimension2D?: number;
	maxTextureDimension3D?: number;
	maxTextureArrayLayers?: number;
	maxBindGroups?: number;
	maxBindGroupsPerShaderStage?: number;
	maxBindingsPerBindGroup?: number;
	maxDynamicUniformBuffersPerPipelineLayout?: number;
	maxDynamicStorageBuffersPerPipelineLayout?: number;
	maxSampledTexturesPerShaderStage?: number;
	maxSamplersPerShaderStage?: number;
	maxStorageBuffersPerShaderStage?: number;
	maxStorageTexturesPerShaderStage?: number;
	maxUniformBuffersPerShaderStage?: number;
	maxUniformBufferBindingSize?: number;
	maxStorageBufferBindingSize?: number;
	maxVertexBuffers?: number;
	maxBufferSize?: number;
	maxVertexAttributes?: number;
	maxVertexBufferArrayStride?: number;
}

// ==================== Screen 类型 ====================

declare class Screen {
	screenManager: ScreenManager;
	initialized: boolean;
	visible: boolean;
	uiViewport: any;
	worldCamera: any;
	screenWidth: number;
	screenHeight: number;
	dpr: number;
	protected _canvas: HTMLCanvasElement | null;
	constructor(screenManager?: ScreenManager);
	initialize(): void;
	getSafeArea(): { x: number; y: number; width: number; height: number };
	_updateScreenSize(): void;
	getCanvas(): HTMLCanvasElement | null;
	protected _updateCanvasSize(): void;
	_initUIViewport(): void;
	_updateViewportOrientation(): void;
	_initWorldCamera(): void;
	init(): void;
	enter(): void;
	exit(): void;
	render(delta: number): void;
	onResize(): void;
	resize(): void;
	handleBack(): boolean;
	destroy(): void;
}

// ==================== ScreenManager 类型 ====================

declare class ScreenManager {
	screens: Map<any, any>;
	screenStack: any[];
	currentScreen: any;
	launchScreen: any;
	popping: boolean;
	transitionState: any;
	transitionTime: number;
	transitionDuration: number;
	onTransitionMiddle: any;
	onTransitionEnd: any;
	overlayFadeDuration: number;
	loadingTaskFinished: boolean;
	loadingMinDuration: number;
	loadingElapsedTime: number;
	constructor();
	register(screenClass: any, instance?: any): this;
	setLaunchScreen(screenClass: any): this;
	goScreen(screenClass: any): this;
	_goScreenInstance(screen: any): this;
	showScreen(screenClass: any): this;
	replaceScreen(screenClass: any): this;
	popScreen(): boolean;
	popTo(targetClass: any): boolean;
	clearStack(): void;
	getCurrentScreen(): any;
	getStackInfo(): string;
	handleBack(): boolean;
	isTransitioning(): boolean;
	render(delta: number): void;
	_getOrCreate(screenClass: any): any;
	_initializeScreen(screen: any): void;
}

// ==================== WebGPUDemo 类型 ====================

declare class WebGPUDemo {
	constructor(canvas: HTMLCanvasElement);
	init(): Promise<boolean>;
	start(): void;
	stop(): void;
	destroy(): void;
}

// ==================== 全局声明 ====================

declare global {
	// ==================== 全局变量 ====================
	interface Window {
		// 构建信息
		CACHE_BUSTER?: number;
		BUILD_VERSION?: string;
		
		// 核心类
		LoadingScreen: typeof import('./loading-screen');
		ScriptLoader: typeof import('./script-loader');
		Toolbar: typeof import('./toolbar');
		PerfMonitor: typeof import('./perf-manager');
		BeanManager: typeof import('./battle-ball/bean-manager');
		Joystick: typeof import('./battle-ball/joystick');
		LoggerCore: typeof import('./logger/core');
		Screen: typeof Screen;
		ScreenManager: typeof ScreenManager;
		WebGPUDemo: typeof WebGPUDemo;
		WebGPUScreen: typeof WebGPUScreen;
		
		// 全局实例
		logger?: Logger;
		toolbar?: InstanceType<typeof import('./toolbar')>;
		screenManager?: ScreenManager;
		game?: any;
		tempPerfMonitor?: any;
		screen?: any;
		
		// 脚本分组配置
		SCRIPT_GROUPS: Record<string, Array<{name: string; src: string; weight?: number; useCache?: boolean}>>;
		
		// 运行时标签获取
		getRuntimeTags?: () => string[];
	}
	
	// ==================== Logger 接口 ====================
	interface Logger {
		/** 记录日志 */
		log(tag: string, message: string, data?: any): void;
		/** 切换日志显示 */
		toggle?(): void;
		/** 清空日志 */
		clear?(): void;
		/** 获取所有日志 */
		getAllLogs?(): string;
		/** 订阅事件 */
		on?(event: string, callback: (data: any) => void): void;
	}
	
	// ==================== 扩展 CanvasRenderingContext2D ====================
	interface CanvasRenderingContext2D {
		// 标准 API 无需扩展，但保留位置以备需要
	}
	
	// ==================== WebGPU Navigator 扩展 ====================
	interface Navigator {
		gpu?: GPU;
	}
	
	// ==================== HTMLCanvasElement WebGPU 扩展 ====================
	interface HTMLCanvasElement {
		getContext(contextId: 'webgpu'): GPUCanvasContext | null;
	}
	
	// ==================== 性能内存扩展 ====================
	interface Performance {
		memory?: {
			/** 已使用的 JS 堆内存大小（字节） */
			usedJSHeapSize: number;
			/** 总的 JS 堆内存大小（字节） */
			totalJSHeapSize: number;
			/** JS 堆内存大小限制（字节） */
			jsHeapSizeLimit?: number;
		};
	}
}

// 确保此文件被视为模块
export {};
