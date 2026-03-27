"use strict";
/**
 * BeanManager - 彩豆管理器
 * 简化版：直接渲染前2万个彩豆
 */
class BeanManager {
    constructor() {
        this.mapSize = 4000;
        this.beanCount = 20000; // 只生成2万个
        this.beanRadius = 5;
        this.colorPalette = [
            0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00,
            0xFF00FF, 0x00FFFF, 0xFFA500, 0x800080,
            0xFFC0CB, 0xA52A2A, 0x808080, 0xFFFFFF,
            0x00CED1, 0xFF6347, 0x7FFF00, 0xDC143C,
            0x4169E1, 0xFFD700, 0xC71585, 0x20B2AA,
            0xFF69B4, 0xCD853F, 0x4682B4, 0xD2691E,
            0x9ACD32, 0xFF4500, 0x2E8B57, 0xF0E68C,
            0xE6E6FA, 0xFFB6C1, 0x87CEEB, 0xDDA0DD
        ];
        this.beans = [];
        this.device = null;
        this.pipeline = null;
        this.bindGroup = null;
        this.instanceBuffer = null;
        this.uniformBuffer = null;
        this.context = null;
    }
    async initWebGPU() {
        if (!navigator.gpu)
            return false;
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter)
            return false;
        this.device = await adapter.requestDevice();
        await this._createPipeline();
        return true;
    }
    async _createPipeline() {
        const vertexShaderCode = `
			struct VertexOutput {
				@builtin(position) position: vec4<f32>,
				@location(0) color: vec4<f32>,
			};
			
			struct InstanceData {
				position: vec2<f32>,
				colorIndex: u32,
				sides: u32,
				rotation: u32,
			};
			
			@binding(0) @group(0) var<uniform> viewMatrix: mat4x4<f32>;
			@binding(1) @group(0) var<uniform> beanRadius: f32;
			@binding(2) @group(0) var<storage, read> instances: array<InstanceData>;
			@binding(3) @group(0) var<storage, read> colorPalette: array<u32>;
			
			@vertex
			fn main(
				@builtin(vertex_index) vertexIndex: u32,
				@builtin(instance_index) instanceIndex: u32
			) -> VertexOutput {
				let instance = instances[instanceIndex];
				
				let sides = instance.sides;
				let rotationRad = f32(instance.rotation) * 0.01745329252;
				let angle = f32(vertexIndex) * 6.28318530718 / f32(sides) + rotationRad;
				let x = cos(angle) * beanRadius;
				let y = sin(angle) * beanRadius;
				
				let worldPos = vec4<f32>(
					instance.position.x + x,
					instance.position.y + y,
					0.0,
					1.0
				);
				
				var output: VertexOutput;
				output.position = viewMatrix * worldPos;
				
				let c = colorPalette[instance.colorIndex];
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
    }
    generateBeans() {
        this.beans = new Array(this.beanCount);
        for (let i = 0; i < this.beanCount; i++) {
            const x = (Math.random() - 0.5) * this.mapSize;
            const y = (Math.random() - 0.5) * this.mapSize;
            const colorIndex = Math.floor(Math.random() * 32);
            const sides = 3 + Math.floor(Math.random() * 4);
            const rotation = Math.floor(Math.random() * 360);
            this.beans[i] = { x, y, colorIndex, sides, rotation };
        }
    }
    _createInstanceBuffer() {
        const instanceSize = 5 * 4;
        const bufferSize = this.beanCount * instanceSize;
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
            uintView[offset + 2] = bean.colorIndex;
            uintView[offset + 3] = bean.sides;
            uintView[offset + 4] = bean.rotation;
        }
        this.instanceBuffer.unmap();
    }
    _createColorPaletteBuffer() {
        this.colorPaletteBuffer = this.device.createBuffer({
            size: 32 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });
        const colorData = new Uint32Array(this.colorPalette);
        this.device.queue.writeBuffer(this.colorPaletteBuffer, 0, colorData);
    }
    async initRenderResources(canvas) {
        if (!this.device) {
            if (window.logger)
                logger.log('BEAN_ERROR', 'initRenderResources: no device');
            return false;
        }
        this.context = canvas.getContext('webgpu');
        if (!this.context) {
            if (window.logger)
                logger.log('BEAN_ERROR', 'initRenderResources: no webgpu context');
            return false;
        }
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.device,
            format: canvasFormat
        });
        this._createInstanceBuffer();
        this._createColorPaletteBuffer();
        this.uniformBuffer = this.device.createBuffer({
            size: 80,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.bindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.uniformBuffer } },
                { binding: 1, resource: { buffer: this.uniformBuffer, offset: 64, size: 4 } },
                { binding: 2, resource: { buffer: this.instanceBuffer } },
                { binding: 3, resource: { buffer: this.colorPaletteBuffer } }
            ]
        });
        // 测试渲染一次
        this._testRender();
        if (window.logger)
            logger.log('BEAN', 'initRenderResources success');
        return true;
    }
    render(cameraX, cameraY, zoom, screenWidth, screenHeight) {
        // 错误检查
        if (!this.device) {
            if (window.logger)
                logger.log('BEAN_ERROR', 'no device');
            return;
        }
        if (!this.pipeline) {
            if (window.logger)
                logger.log('BEAN_ERROR', 'no pipeline');
            return;
        }
        if (!this.context) {
            if (window.logger)
                logger.log('BEAN_ERROR', 'no context');
            return;
        }
        if (!this.instanceBuffer) {
            if (window.logger)
                logger.log('BEAN_ERROR', 'no instanceBuffer');
            return;
        }
        if (!this.bindGroup) {
            if (window.logger)
                logger.log('BEAN_ERROR', 'no bindGroup');
            return;
        }
        if (window.logger)
            logger.log('BEAN', `render: ${this.beanCount} beans`);
        // 更新 view matrix
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
        const params = new Float32Array(20);
        params[0] = sx;
        params[1] = 0;
        params[2] = 0;
        params[3] = 0;
        params[4] = 0;
        params[5] = sy;
        params[6] = 0;
        params[7] = 0;
        params[8] = 0;
        params[9] = 0;
        params[10] = 1;
        params[11] = 0;
        params[12] = tx;
        params[13] = ty;
        params[14] = 0;
        params[15] = 1;
        params[16] = this.beanRadius;
        this.device.queue.writeBuffer(this.uniformBuffer, 0, params);
        // 渲染
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                    view: this.context.getCurrentTexture().createView(),
                    clearValue: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 }, // 红色背景测试
                    loadOp: 'clear',
                    storeOp: 'store'
                }]
        });
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bindGroup);
        pass.draw(6, this.beanCount); // 直接渲染全部2万个
        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }
    // 禁用吃豆
    eatBeans(playerX, playerY, playerRadius) {
        return 0;
    }
    destroy() {
        if (this.instanceBuffer)
            this.instanceBuffer.destroy();
        if (this.colorPaletteBuffer)
            this.colorPaletteBuffer.destroy();
        if (this.uniformBuffer)
            this.uniformBuffer.destroy();
        if (this.device)
            this.device.destroy();
    }
}
window.BeanManager = BeanManager;
//# sourceMappingURL=bean-manager.js.map