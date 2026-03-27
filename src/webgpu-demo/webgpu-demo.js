/**
 * WebGPU Compute Shader Particle System Demo
 * Based on: https://github.com/andrinr/webgpu-particles
 * A minimal example of particle system using WebGPU compute shaders
 */

const WORKGROUP_SIZE = 8;
const GRID_SIZE = 512;
const UPDATE_INTERVAL = 30;

class WebGPUDemo {
	constructor(canvas) {
		this.canvas = canvas;
		this.step = 0;
		this.device = null;
		this.canvasContext = null;
		this.canvasFormat = null;
		this.animationId = null;
		this.initialized = false;
	}

	async init() {
		if (this.initialized) return true;

		// Check WebGPU support
		if (!navigator.gpu) {
			if (window.logger) logger.log('WEBGPU', 'WebGPU not supported on this browser');
			throw new Error('WebGPU not supported on this browser.');
		}

		// Request adapter
		const adapter = await navigator.gpu.requestAdapter();
		if (!adapter) {
			if (window.logger) logger.log('WEBGPU', 'No appropriate GPUAdapter found');
			throw new Error('No appropriate GPUAdapter found.');
		}

		// Request device
		this.device = await adapter.requestDevice();
		this.canvasContext = this.canvas.getContext('webgpu');
		this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();

		this.canvasContext.configure({
			device: this.device,
			format: this.canvasFormat,
		});

		await this.setupBuffers();
		await this.setupShaders();
		await this.setupPipelines();

		this.initialized = true;
		if (window.logger) logger.log('WEBGPU', 'WebGPU demo initialized successfully');
		return true;
	}

	async setupBuffers() {
		// Initialize data on host
		this.uniformSize = new Float32Array([GRID_SIZE, GRID_SIZE]);
		this.uniformDt = new Float32Array([UPDATE_INTERVAL / 1000.0]);

		const s = 1.0;
		this.vertices = new Float32Array([
			-s, -s, // Triangle 1
			s, -s,
			s, s,
			-s, -s, // Triangle 2
			s, s,
			-s, s,
		]);

		this.particleStateArray = new Float32Array(GRID_SIZE * GRID_SIZE * 4);
		for (let i = 0; i < this.particleStateArray.length; i += 4) {
			this.particleStateArray[i] = (i / 4 % GRID_SIZE) / GRID_SIZE; // x
			this.particleStateArray[i + 1] = Math.floor(i / 4 / GRID_SIZE) / GRID_SIZE; // y
			this.particleStateArray[i + 2] = Math.random() * 0.1 - 0.05; // vx
			this.particleStateArray[i + 3] = Math.random() * 0.1 - 0.05; // vy
		}

		// Create Buffers
		this.sizeBuffer = this.device.createBuffer({
			label: 'Size Uniform',
			size: this.uniformSize.byteLength,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		this.dtBuffer = this.device.createBuffer({
			label: 'Dt Uniform',
			size: this.uniformDt.byteLength,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		this.vertexBuffer = this.device.createBuffer({
			label: 'Vertices',
			size: this.vertices.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});

		this.particleStateBuffers = [
			this.device.createBuffer({
				label: 'Particle State A',
				size: this.particleStateArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			}),
			this.device.createBuffer({
				label: 'Particle State B',
				size: this.particleStateArray.byteLength,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
			})
		];

		// Copy data from host to device
		this.device.queue.writeBuffer(this.sizeBuffer, 0, this.uniformSize);
		this.device.queue.writeBuffer(this.dtBuffer, 0, this.uniformDt);
		this.device.queue.writeBuffer(this.vertexBuffer, 0, this.vertices);
		this.device.queue.writeBuffer(this.particleStateBuffers[0], 0, this.particleStateArray);
		this.device.queue.writeBuffer(this.particleStateBuffers[1], 0, this.particleStateArray);
	}

	async loadShader(path, label) {
		const response = await fetch(path);
		const shaderString = await response.text();
		return this.device.createShaderModule({
			label: label || 'Shader',
			code: shaderString,
		});
	}

	async setupShaders() {
		// Load shaders
		this.vertexShaderModule = await this.loadShader('shaders/vertex.wgsl', 'Vertex shader');
		this.fragmentShaderModule = await this.loadShader('shaders/fragment.wgsl', 'Fragment shader');
		this.computeShaderModule = await this.loadShader('shaders/compute.wgsl', 'Compute shader');

		// Define vertex buffer layout
		this.vertexBufferLayout = {
			arrayStride: 8, // each vertex is 2 32-bit floats (x, y)
			attributes: [{
				format: 'float32x2',
				offset: 0,
				shaderLocation: 0,
			}],
			stepMode: 'vertex',
		};
	}

	async setupPipelines() {
		// Bind group layout
		this.bindGroupLayout = this.device.createBindGroupLayout({
			label: 'Bind group layout',
			entries: [{
				binding: 0,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
				buffer: { type: 'uniform' }
			}, {
				binding: 1,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
				buffer: { type: 'uniform' }
			}, {
				binding: 2,
				visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
				buffer: { type: 'read-only-storage' }
			}, {
				binding: 3,
				visibility: GPUShaderStage.COMPUTE,
				buffer: { type: 'storage' }
			}]
		});

		// Bind groups
		this.bindGroups = [
			this.device.createBindGroup({
				label: 'Renderer bind group A',
				layout: this.bindGroupLayout,
				entries: [{
					binding: 0,
					resource: { buffer: this.sizeBuffer }
				}, {
					binding: 1,
					resource: { buffer: this.dtBuffer }
				}, {
					binding: 2,
					resource: { buffer: this.particleStateBuffers[0] }
				}, {
					binding: 3,
					resource: { buffer: this.particleStateBuffers[1] }
				}],
			}),
			this.device.createBindGroup({
				label: 'Renderer bind group B',
				layout: this.bindGroupLayout,
				entries: [{
					binding: 0,
					resource: { buffer: this.sizeBuffer }
				}, {
					binding: 1,
					resource: { buffer: this.dtBuffer }
				}, {
					binding: 2,
					resource: { buffer: this.particleStateBuffers[1] }
				}, {
					binding: 3,
					resource: { buffer: this.particleStateBuffers[0] }
				}],
			})
		];

		// Pipeline layout
		this.pipelineLayout = this.device.createPipelineLayout({
			label: 'Renderer Pipeline Layout',
			bindGroupLayouts: [this.bindGroupLayout],
		});

		// Render pipeline
		this.renderPipeline = this.device.createRenderPipeline({
			label: 'Renderer pipeline',
			layout: this.pipelineLayout,
			vertex: {
				module: this.vertexShaderModule,
				entryPoint: 'main',
				buffers: [this.vertexBufferLayout]
			},
			fragment: {
				module: this.fragmentShaderModule,
				entryPoint: 'main',
				targets: [{
					format: this.canvasFormat
				}]
			}
		});

		// Compute pipeline
		this.computePipeline = this.device.createComputePipeline({
			label: 'Compute pipeline',
			layout: this.pipelineLayout,
			compute: {
				module: this.computeShaderModule,
				entryPoint: 'main',
			}
		});
	}

	update() {
		if (!this.initialized) return;

		this.step++;

		const encoder = this.device.createCommandEncoder();

		// Compute pass
		const computePass = encoder.beginComputePass();
		computePass.setPipeline(this.computePipeline);
		computePass.setBindGroup(0, this.bindGroups[this.step % 2]);
		const workgroupCount = Math.ceil(GRID_SIZE / WORKGROUP_SIZE);
		computePass.dispatchWorkgroups(workgroupCount, workgroupCount);
		computePass.end();

		// Render pass
		const renderPass = encoder.beginRenderPass({
			colorAttachments: [{
				view: this.canvasContext.getCurrentTexture().createView(),
				loadOp: 'clear',
				clearValue: [0.0, 0.0, 0.0, 1.0],
				storeOp: 'store',
			}]
		});

		renderPass.setPipeline(this.renderPipeline);
		renderPass.setVertexBuffer(0, this.vertexBuffer);
		renderPass.setBindGroup(0, this.bindGroups[this.step % 2]);
		renderPass.draw(this.vertices.length / 2, GRID_SIZE * GRID_SIZE);

		renderPass.end();

		this.device.queue.submit([encoder.finish()]);
	}

	start() {
		if (!this.initialized) return;
		
		const loop = () => {
			this.update();
			this.animationId = requestAnimationFrame(loop);
		};
		loop();
		
		if (window.logger) logger.log('WEBGPU', 'Demo started');
	}

	stop() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
		if (window.logger) logger.log('WEBGPU', 'Demo stopped');
	}

	destroy() {
		this.stop();
		// Cleanup resources
		if (this.device) {
			this.device.destroy();
		}
		this.initialized = false;
	}
}

// Export for use in other modules
window.WebGPUDemo = WebGPUDemo;
