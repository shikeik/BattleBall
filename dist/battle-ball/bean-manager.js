"use strict";
/**
 * BeanManager - 彩豆管理器
 * 80万彩豆的生成、存储和渲染
 */
class BeanManager {
    constructor() {
        this.mapSize = 4000;
        this.gridCount = 40;
        this.gridSize = this.mapSize / this.gridCount;
        this.beanCount = 800000;
        this.beanRadius = 5;
        this.beans = [];
        this.gridIndex = new Map();
        this.eatenBeans = new Set();
        this.eatenCount = 0;
        // WebGPU
        this.device = null;
        this.context = null;
        if (window.logger)
            logger.log('BEAN', 'BeanManager created');
    }
    async initWebGPU() {
        if (!navigator.gpu) {
            if (window.logger)
                logger.log('BEAN', 'WebGPU not supported');
            return false;
        }
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            if (window.logger)
                logger.log('BEAN', 'Failed to get WebGPU adapter');
            return false;
        }
        this.device = await adapter.requestDevice();
        if (window.logger)
            logger.log('BEAN', 'WebGPU device created');
        return true;
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
            const sides = 3 + Math.floor(Math.random() * 4);
            this.beans[i] = {
                x, y,
                color,
                sides,
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
        if (window.logger)
            logger.log('BEAN', `Generated ${this.beanCount} beans`);
    }
    async initRenderResources(canvas) {
        if (!this.device)
            return false;
        this.context = canvas.getContext('webgpu');
        if (!this.context) {
            if (window.logger)
                logger.log('BEAN', 'Failed to get WebGPU context');
            return false;
        }
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.device,
            format: canvasFormat
        });
        if (window.logger)
            logger.log('BEAN', 'Render resources initialized');
        return true;
    }
    render(cameraX, cameraY, zoom, screenWidth, screenHeight) {
        if (!this.device || !this.context)
            return;
        // 清空画布为深色背景
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                    view: this.context.getCurrentTexture().createView(),
                    clearValue: { r: 0.039, g: 0.039, b: 0.102, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store'
                }]
        });
        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }
    eatBeans(playerX, playerY, playerRadius) {
        // 暂时禁用吃豆
        return 0;
    }
    destroy() {
        if (this.device)
            this.device.destroy();
    }
}
window.BeanManager = BeanManager;
//# sourceMappingURL=bean-manager.js.map