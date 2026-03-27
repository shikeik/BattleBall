/**
 * BeanManager - 彩豆管理器
 * 负责80万彩豆的生成、存储和渲染
 * 
 * 技术方案：
 * - WebGPU 实例化渲染
 * - 空间分割：40×40 网格索引
 * - 视锥剔除：只渲染屏幕内的彩豆
 */
class BeanManager {
	constructor() {
		// 地图配置
		this.mapSize = 4000;
		this.gridCount = 40;  // 40×40 网格
		this.gridSize = this.mapSize / this.gridCount;  // 100
		
		// 彩豆配置
		this.beanCount = 800000;  // 80万
		this.beanRadius = 5;
		
		// 彩豆数据
		this.beans = [];  // 所有彩豆数据
		this.gridIndex = new Map();  // 网格索引：gridKey -> [beanIndices]
		
		// WebGPU 相关
		this.device = null;
		this.pipeline = null;
		this.bindGroup = null;
		this.vertexBuffer = null;
		this.instanceBuffer = null;
		
		if (window.logger) logger.log('BEAN', 'BeanManager created');
	}
	
	/**
	 * 初始化 WebGPU
	 */
	async initWebGPU() {
		if (!navigator.gpu) {
			if (window.logger) logger.log('BEAN', 'WebGPU not supported');
			return false;
		}
		
		const adapter = await navigator.gpu.requestAdapter();
		if (!adapter) {
			if (window.logger) logger.log('BEAN', 'Failed to get WebGPU adapter');
			return false;
		}
		
		this.device = await adapter.requestDevice();
		if (window.logger) logger.log('BEAN', 'WebGPU device created');
		
		// 创建渲染管线
		await this._createPipeline();
		
		return true;
	}
	
	/**
	 * 创建渲染管线
	 */
	async _createPipeline() {
		// 顶点着色器
		const vertexShaderCode = `
			struct VertexOutput {
				@builtin(position) position: vec4<f32>,
				@location(0) color: vec4<f32>,
			};
			
			struct InstanceData {
				position: vec2<f32>,
				color: u32,
				sides: u32,
				rotation: f32,
				radius: f32,
			};
			
			@binding(0) @group(0) var<uniform> viewMatrix: mat4x4<f32>;
			@binding(1) @group(0) var<storage, read> instances: array<InstanceData>;
			
			@vertex
			fn main(
				@builtin(vertex_index) vertexIndex: u32,
				@builtin(instance_index) instanceIndex: u32
			) -> VertexOutput {
				let instance = instances[instanceIndex];
				
				// 生成多边形顶点
				let sides = instance.sides;
				let angle = f32(vertexIndex) * 6.28318 / f32(sides) + instance.rotation;
				let x = cos(angle) * instance.radius;
				let y = sin(angle) * instance.radius;
				
				let worldPos = vec4<f32>(
					instance.position.x + x,
					instance.position.y + y,
					0.0,
					1.0
				);
				
				var output: VertexOutput;
				output.position = viewMatrix * worldPos;
				
				// 解码颜色
				let color = instance.color;
				output.color = vec4<f32>(
					f32((color >> 16) & 0xFF) / 255.0,
					f32((color >> 8) & 0xFF) / 255.0,
					f32(color & 0xFF) / 255.0,
					1.0
				);
				
				return output;
			}
		`;
		
		// 片段着色器
		const fragmentShaderCode = `
			@fragment
			fn main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
				return color;
			}
		`;
		
		// 编译着色器
		const vertexShader = this.device.createShaderModule({
			code: vertexShaderCode
		});
		
		const fragmentShader = this.device.createShaderModule({
			code: fragmentShaderCode
		});
		
		// 创建管线
		this.pipeline = this.device.createRenderPipeline({
			layout: 'auto',
			vertex: {
				module: vertexShader,
				entryPoint: 'main'
			},
			fragment: {
				module: fragmentShader,
				entryPoint: 'main',
				targets: [{
					format: navigator.gpu.getPreferredCanvasFormat()
				}]
			},
			primitive: {
				topology: 'triangle-list'
			}
		});
		
		if (window.logger) logger.log('BEAN', 'Render pipeline created');
	}
	
	/**
	 * 生成彩豆
	 */
	generateBeans() {
		this.beans = new Array(this.beanCount);
		this.gridIndex.clear();
		
		const mapHalf = this.mapSize / 2;
		
		for (let i = 0; i < this.beanCount; i++) {
			// 随机位置
			const x = (Math.random() - 0.5) * this.mapSize;
			const y = (Math.random() - 0.5) * this.mapSize;
			
			// 随机颜色（RGB）
			const r = Math.floor(Math.random() * 256);
			const g = Math.floor(Math.random() * 256);
			const b = Math.floor(Math.random() * 256);
			const color = (r << 16) | (g << 8) | b;
			
			// 随机边形（3-6）
			const sides = 3 + Math.floor(Math.random() * 4);
			
			// 随机旋转
			const rotation = Math.random() * Math.PI * 2;
			
			this.beans[i] = {
				x, y,
				color,
				sides,
				rotation,
				radius: this.beanRadius
			};
			
			// 添加到网格索引
			const gridX = Math.floor((x + mapHalf) / this.gridSize);
			const gridY = Math.floor((y + mapHalf) / this.gridSize);
			const gridKey = `${gridX},${gridY}`;
			
			if (!this.gridIndex.has(gridKey)) {
				this.gridIndex.set(gridKey, []);
			}
			this.gridIndex.get(gridKey).push(i);
		}
		
		if (window.logger) logger.log('BEAN', `Generated ${this.beanCount} beans`);
	}
	
	/**
	 * 创建实例缓冲区
	 */
	_createInstanceBuffer() {
		// 每个实例：position(2) + color(1) + sides(1) + rotation(1) + radius(1) = 6 floats = 24 bytes
		const instanceSize = 6 * 4;
		const bufferSize = this.beanCount * instanceSize;
		
		this.instanceBuffer = this.device.createBuffer({
			size: bufferSize,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});
		
		// 填充数据
		const data = new Float32Array(this.instanceBuffer.getMappedRange());
		const uintView = new Uint32Array(this.instanceBuffer.getMappedRange());
		
		for (let i = 0; i < this.beanCount; i++) {
			const bean = this.beans[i];
			const offset = i * 6;
			
			data[offset + 0] = bean.x;
			data[offset + 1] = bean.y;
			uintView[offset + 2] = bean.color;
			uintView[offset + 3] = bean.sides;
			data[offset + 4] = bean.rotation;
			data[offset + 5] = bean.radius;
		}
		
		this.instanceBuffer.unmap();
		
		if (window.logger) logger.log('BEAN', 'Instance buffer created');
	}
	
	/**
	 * 获取视锥内的彩豆索引
	 */
	getVisibleBeans(cameraX, cameraY, viewWidth, viewHeight) {
		const visibleIndices = [];
		
		// 计算视锥覆盖的网格范围
		const mapHalf = this.mapSize / 2;
		const minX = Math.floor((cameraX - viewWidth / 2 + mapHalf) / this.gridSize);
		const maxX = Math.floor((cameraX + viewWidth / 2 + mapHalf) / this.gridSize);
		const minY = Math.floor((cameraY - viewHeight / 2 + mapHalf) / this.gridSize);
		const maxY = Math.floor((cameraY + viewHeight / 2 + mapHalf) / this.gridSize);
		
		// 遍历覆盖的网格
		for (let gy = Math.max(0, minY); gy <= Math.min(this.gridCount - 1, maxY); gy++) {
			for (let gx = Math.max(0, minX); gx <= Math.min(this.gridCount - 1, maxX); gx++) {
				const gridKey = `${gx},${gy}`;
				const indices = this.gridIndex.get(gridKey);
				if (indices) {
					visibleIndices.push(...indices);
				}
			}
		}
		
		return visibleIndices;
	}
	
	/**
	 * 渲染彩豆
	 */
	render(cameraX, cameraY, zoom, screenWidth, screenHeight) {
		if (!this.device || !this.pipeline) return;
		
		// 计算视锥范围
		const viewWidth = screenWidth / zoom;
		const viewHeight = screenHeight / zoom;
		
		// 获取可见彩豆
		const visibleBeans = this.getVisibleBeans(cameraX, cameraY, viewWidth, viewHeight);
		
		if (visibleBeans.length === 0) return;
		
		// TODO: 渲染可见彩豆
		if (window.logger) logger.log('BEAN', `Rendering ${visibleBeans.length} visible beans`);
	}
	
	/**
	 * 销毁资源
	 */
	destroy() {
		if (this.instanceBuffer) {
			this.instanceBuffer.destroy();
		}
		if (this.device) {
			this.device.destroy();
		}
	}
}

window.BeanManager = BeanManager;
