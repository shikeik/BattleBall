/**
 * BeanManager - 彩豆管理器
 * 使用 WebGPU 实例化渲染高效渲染 80 万彩豆
 * 
 * 优化策略：
 * - 所有彩豆数据一次性上传到 GPU
 * - 顶点着色器中进行视锥剔除（将被剔除的彩豆半径设为 0）
 * - 一次 draw 调用渲染所有彩豆
 */
class BeanManager {
	constructor() {
		// 地图配置
		this.mapSize = 4000;
		this.gridCount = 40;
		this.gridSize = this.mapSize / this.gridCount;
		
		// 彩豆配置
		this.beanCount = 800000;
		this.beanRadius = 5;
		
		// 彩豆数据
		this.beans = [];
		this.gridIndex = new Map();
		this.eatenBeans = new Set();
		this.eatenCount = 0;
		
		// WebGPU
		this.device = null;
		this.pipeline = null;
		this.bindGroup = null;
		this.instanceBuffer = null;
		this.uniformBuffer = null;
		this.context = null;
		
		if (window.logger) logger.log('BEAN', 'BeanManager created');
	}
	
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
		
		await this._createPipeline();
		return true;
	}
	
	async _createPipeline() {
		// 顶点着色器 - 在 GPU 端进行视锥剔除
		const vertexShaderCode = `
			struct VertexOutput {
				@builtin(position) position: vec4<f32>,
				@location(0) color: vec4<f32>,
			};
			
			struct InstanceData {
				position: vec2<f32>,
				color: u32,
				rotation: f32,
				radius: f32,
			};
			
			struct ViewParams {
				viewMatrix: mat4x4<f32>,
				cameraPos: vec2<f32>,
				viewHalfSize: vec2<f32>,
			};
			
			@binding(0) @group(0) var<uniform> viewParams: ViewParams;
			@binding(1) @group(0) var<storage, read> instances: array<InstanceData>;
			
			@vertex
			fn main(
				@builtin(vertex_index) vertexIndex: u32,
				@builtin(instance_index) instanceIndex: u32
			) -> VertexOutput {
				let instance = instances[instanceIndex];
				
				// 视锥剔除：检查彩豆是否在视锥内
				let localPos = instance.position - viewParams.cameraPos;
				let inView = abs(localPos.x) <= viewParams.viewHalfSize.x + instance.radius 
							&& abs(localPos.y) <= viewParams.viewHalfSize.y + instance.radius;
				
				// 如果被剔除或已被吃掉（radius=0），将顶点移到屏幕外
				var effectiveRadius = instance.radius;
				if (!inView || instance.radius <= 0.0) {
					effectiveRadius = 0.0;
				}
				
				// 生成六边形顶点
				let angle = f32(vertexIndex) * 1.0472 + instance.rotation;
				let x = cos(angle) * effectiveRadius;
				let y = sin(angle) * effectiveRadius;
				
				let worldPos = vec4<f32>(
					instance.position.x + x,
					instance.position.y + y,
					0.0,
					1.0
				);
				
				var output: VertexOutput;
				output.position = viewParams.viewMatrix * worldPos;
				
				// 解码颜色
				let c = instance.color;
				output.color = vec4<f32>(
					f32((c >> 16) & 0xFF) / 255.0,
					f32((c >> 8) & 0xFF) / 255.0,
					f32(c & 0xFF) / 255.0,
					1.0
				);
				
				return output;
			}
		`;
		
		const fragmentShaderCode = `
			@fragment
			fn main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
				return color;
			}
		`;
		
		const vertexShader = this.device.createShaderModule({ code: vertexShaderCode });
		const fragmentShader = this.device.createShaderModule({ code: fragmentShaderCode });
		
		this.pipeline = this.device.createRenderPipeline({
			layout: 'auto',
			vertex: {
				module: vertexShader,
				entryPoint: 'main'
			},
			fragment: {
				module: fragmentShader,
				entryPoint: 'main',
				targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
			},
			primitive: {
				topology: 'triangle-list'
			}
		});
		
		if (window.logger) logger.log('BEAN', 'Render pipeline created');
	}
	
	generateBeans() {
		this.beans = new Array(this.beanCount);
		this.gridIndex.clear();
		
		const mapHalf = this.mapSize / 2;
		
		for (let i = 0; i < this.beanCount; i++) {
			const x = (Math.random() - 0.5) * this.mapSize;
			const y = (Math.random() - 0.5) * this.mapSize;
			
			const r = Math.floor(Math.random() * 256);
			const g = Math.floor(Math.random() * 256);
			const b = Math.floor(Math.random() * 256);
			const color = (r << 16) | (g << 8) | b;
			
			const rotation = Math.random() * Math.PI * 2;
			
			this.beans[i] = {
				x, y,
				color,
				rotation,
				radius: this.beanRadius,
				eaten: false
			};
			
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
	
	_createInstanceBuffer() {
		try {
			// 每个实例：position(2) + color(1) + rotation(1) + radius(1) = 5 floats = 20 bytes
			const instanceSize = 5 * 4;
			const bufferSize = this.beanCount * instanceSize;
			
			if (window.logger) logger.log('BEAN', `Creating instance buffer: ${bufferSize} bytes`);
			
			this.instanceBuffer = this.device.createBuffer({
				size: bufferSize,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
				mappedAtCreation: true
			});
			
			const mappedRange = this.instanceBuffer.getMappedRange();
			const data = new Float32Array(mappedRange);
			const uintView = new Uint32Array(mappedRange);
			
			for (let i = 0; i < this.beanCount; i++) {
				const bean = this.beans[i];
				const offset = i * 5;
				
				data[offset + 0] = bean.x;
				data[offset + 1] = bean.y;
				uintView[offset + 2] = bean.color;
				data[offset + 3] = bean.rotation;
				data[offset + 4] = bean.radius;
			}
			
			this.instanceBuffer.unmap();
			
			if (window.logger) logger.log('BEAN', 'Instance buffer created successfully');
		} catch (e) {
			if (window.logger) logger.log('BEAN', `Failed to create instance buffer: ${e.message}`);
			throw e;
		}
	}
	
	async initRenderResources(canvas) {
		if (!this.device) return false;
		
		this.context = canvas.getContext('webgpu');
		if (!this.context) {
			if (window.logger) logger.log('BEAN', 'Failed to get WebGPU context');
			return false;
		}
		
		const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
		this.context.configure({
			device: this.device,
			format: canvasFormat
		});
		
		this.canvasFormat = canvasFormat;
		
		// 创建 uniform buffer（包含 viewMatrix + cameraPos + viewHalfSize）
		// mat4x4 = 64 bytes, vec2 = 8 bytes, vec2 = 8 bytes，总共 80 字节，对齐到 16 字节 = 80
		this.uniformBuffer = this.device.createBuffer({
			size: 80,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});
		
		this.bindGroup = this.device.createBindGroup({
			layout: this.pipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: { buffer: this.uniformBuffer } },
				{ binding: 1, resource: { buffer: this.instanceBuffer } }
			]
		});
		
		if (window.logger) logger.log('BEAN', 'Render resources initialized');
		return true;
	}
	
	render(cameraX, cameraY, zoom, screenWidth, screenHeight) {
		if (!this.device || !this.pipeline || !this.context) return;
		
		// 更新 view 参数
		this._updateViewParams(cameraX, cameraY, zoom, screenWidth, screenHeight);
		
		// 创建 command encoder
		const encoder = this.device.createCommandEncoder();
		
		// 渲染 pass
		const pass = encoder.beginRenderPass({
			colorAttachments: [{
				view: this.context.getCurrentTexture().createView(),
				clearValue: { r: 0.039, g: 0.039, b: 0.102, a: 1.0 },
				loadOp: 'clear',
				storeOp: 'store'
			}]
		});
		
		pass.setPipeline(this.pipeline);
		pass.setBindGroup(0, this.bindGroup);
		
		// 一次 draw 调用渲染所有彩豆（视锥剔除在 GPU 端完成）
		pass.draw(6, this.beanCount);
		
		pass.end();
		
		this.device.queue.submit([encoder.finish()]);
	}
	
	_updateViewParams(cameraX, cameraY, zoom, screenWidth, screenHeight) {
		const halfW = screenWidth / (2 * zoom);
		const halfH = screenHeight / (2 * zoom);
		
		const left = cameraX - halfW;
		const right = cameraX + halfW;
		const bottom = cameraY - halfH;
		const top = cameraY + halfH;
		
		const tx = -(right + left) / (right - left);
		const ty = -(top + bottom) / (top - bottom);
		const sx = 2 / (right - left);
		const sy = 2 / (top - bottom);
		
		// 构建 uniform 数据：mat4x4 (64字节) + vec2 (8字节) + vec2 (8字节) = 80字节
		const params = new Float32Array(20); // 80 / 4 = 20 floats
		
		// viewMatrix (16 floats)
		params[0] = sx;   params[1] = 0;    params[2] = 0;    params[3] = 0;
		params[4] = 0;    params[5] = sy;   params[6] = 0;    params[7] = 0;
		params[8] = 0;    params[9] = 0;    params[10] = 1;   params[11] = 0;
		params[12] = tx;  params[13] = ty;  params[14] = 0;   params[15] = 1;
		
		// cameraPos (2 floats)
		params[16] = cameraX;
		params[17] = cameraY;
		
		// viewHalfSize (2 floats)
		params[18] = halfW;
		params[19] = halfH;
		
		this.device.queue.writeBuffer(this.uniformBuffer, 0, params);
	}
	
	eatBeans(playerX, playerY, playerRadius) {
		const eatRadius = playerRadius + this.beanRadius;
		const eatRadiusSq = eatRadius * eatRadius;
		let eaten = 0;
		
		const mapHalf = this.mapSize / 2;
		const playerGridX = Math.floor((playerX + mapHalf) / this.gridSize);
		const playerGridY = Math.floor((playerY + mapHalf) / this.gridSize);
		
		for (let gy = Math.max(0, playerGridY - 1); gy <= Math.min(this.gridCount - 1, playerGridY + 1); gy++) {
			for (let gx = Math.max(0, playerGridX - 1); gx <= Math.min(this.gridCount - 1, playerGridX + 1); gx++) {
				const indices = this.gridIndex.get(`${gx},${gy}`);
				if (!indices) continue;
				
				for (const idx of indices) {
					const bean = this.beans[idx];
					if (bean.eaten) continue;
					
					const dx = bean.x - playerX;
					const dy = bean.y - playerY;
					const distSq = dx * dx + dy * dy;
					
					if (distSq < eatRadiusSq) {
						bean.eaten = true;
						this.eatenBeans.add(idx);
						eaten++;
					}
				}
			}
		}
		
		if (eaten > 0) {
			this.eatenCount += eaten;
			this._updateEatenBeansInGPU();
		}
		
		return eaten;
	}
	
	_updateEatenBeansInGPU() {
		if (!this.device || !this.instanceBuffer) return;
		
		const batchSize = 100;
		const toUpdate = Array.from(this.eatenBeans).slice(0, batchSize);
		
		for (const idx of toUpdate) {
			const offset = idx * 20 + 16; // radius 在偏移 16 处
			const radiusData = new Float32Array([0]);
			this.device.queue.writeBuffer(this.instanceBuffer, offset, radiusData);
			this.eatenBeans.delete(idx);
		}
	}
	
	destroy() {
		if (this.instanceBuffer) this.instanceBuffer.destroy();
		if (this.uniformBuffer) this.uniformBuffer.destroy();
		if (this.device) this.device.destroy();
	}
}

window.BeanManager = BeanManager;
