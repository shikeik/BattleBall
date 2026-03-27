/**
 * BeanTestScreen - 彩豆渲染测试场景
 * 最简单的测试：只渲染2万个彩豆
 */
class BeanTestScreen extends Screen {
	init() {
		this.beanManager = null;
		this.initialized = false;
	}
	
	async enter() {
		super.enter();
		
		if (!window.BeanManager) {
			if (window.logger) logger.log('BEAN_TEST', 'BeanManager not found');
			return;
		}
		
		this.beanManager = new BeanManager();
		
		// 初始化 WebGPU
		const success = await this.beanManager.initWebGPU();
		if (!success) {
			if (window.logger) logger.log('BEAN_TEST', 'WebGPU init failed');
			return;
		}
		
		// 生成彩豆
		this.beanManager.generateBeans();
		this.beanManager._createInstanceBuffer();
		this.beanManager._createColorPaletteBuffer();
		
		// 创建 canvas
		const canvas = document.getElementById('gameCanvas');
		if (!canvas) {
			if (window.logger) logger.log('BEAN_TEST', 'Canvas not found');
			return;
		}
		
		// 配置 WebGPU context
		const context = canvas.getContext('webgpu');
		if (!context) {
			if (window.logger) logger.log('BEAN_TEST', 'WebGPU context not available');
			return;
		}
		
		const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
		context.configure({
			device: this.beanManager.device,
			format: canvasFormat
		});
		
		this.beanManager.context = context;
		this.beanManager.canvasFormat = canvasFormat;
		
		// 创建 uniform buffer
		this.beanManager.uniformBuffer = this.beanManager.device.createBuffer({
			size: 80,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		});
		
		// 创建 bind group
		this.beanManager.bindGroup = this.beanManager.device.createBindGroup({
			layout: this.beanManager.pipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: { buffer: this.beanManager.uniformBuffer } },
				{ binding: 1, resource: { buffer: this.beanManager.uniformBuffer, offset: 64, size: 4 } },
				{ binding: 2, resource: { buffer: this.beanManager.instanceBuffer } },
				{ binding: 3, resource: { buffer: this.beanManager.colorPaletteBuffer } }
			]
		});
		
		this.initialized = true;
		if (window.logger) logger.log('BEAN_TEST', 'Initialized successfully');
		
		// 启动渲染循环
		this._startRenderLoop();
	}
	
	_startRenderLoop() {
		const loop = () => {
			if (!this.visible || !this.initialized) return;
			
			this._render();
			requestAnimationFrame(loop);
		};
		requestAnimationFrame(loop);
	}
	
	_render() {
		if (!this.beanManager || !this.beanManager.device) return;
		
		const canvas = document.getElementById('gameCanvas');
		const width = canvas.width;
		const height = canvas.height;
		
		// 简单的 view matrix（正交投影，显示整个地图）
		const zoom = 0.5; // 缩小看全貌
		const halfW = width / (2 * zoom);
		const halfH = height / (2 * zoom);
		
		const sx = 2 / (halfW * 2);
		const sy = 2 / (halfH * 2);
		
		const params = new Float32Array(20);
		params[0] = sx;   params[1] = 0;    params[2] = 0;    params[3] = 0;
		params[4] = 0;    params[5] = sy;   params[6] = 0;    params[7] = 0;
		params[8] = 0;    params[9] = 0;    params[10] = 1;   params[11] = 0;
		params[12] = 0;   params[13] = 0;   params[14] = 0;   params[15] = 1;
		params[16] = this.beanManager.beanRadius;
		
		this.beanManager.device.queue.writeBuffer(this.beanManager.uniformBuffer, 0, params);
		
		// 渲染
		const encoder = this.beanManager.device.createCommandEncoder();
		
		const pass = encoder.beginRenderPass({
			colorAttachments: [{
				view: this.beanManager.context.getCurrentTexture().createView(),
				clearValue: { r: 0.5, g: 0.0, b: 0.0, a: 1.0 }, // 深红色背景
				loadOp: 'clear',
				storeOp: 'store'
			}]
		});
		
		pass.setPipeline(this.beanManager.pipeline);
		pass.setBindGroup(0, this.beanManager.bindGroup);
		pass.draw(6, this.beanManager.beanCount);
		
		pass.end();
		
		this.beanManager.device.queue.submit([encoder.finish()]);
	}
	
	exit() {
		super.exit();
		if (this.beanManager) {
			this.beanManager.destroy();
			this.beanManager = null;
		}
		this.initialized = false;
	}
	
	handleBack() {
		return this.screenManager.popScreen();
	}
}

window.BeanTestScreen = BeanTestScreen;
