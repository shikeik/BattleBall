"use strict";
/**
 * Joystick - 虚拟摇杆
 * 用于控制玩家移动
 */
class Joystick {
    constructor(options = {}) {
        this.canvas = options.canvas || document.getElementById('gameCanvas');
        this.radius = options.radius || 60;
        this.innerRadius = options.innerRadius || 30;
        this.position = options.position || { x: 120, y: 0 }; // y=0 表示底部偏移
        this.bottomOffset = options.bottomOffset || 150;
        // 状态
        this.active = false;
        this.touchId = null;
        this.centerX = 0;
        this.centerY = 0;
        this.dx = 0; // -1 to 1
        this.dy = 0; // -1 to 1
        // 回调
        this.onMove = options.onMove || null;
        this.onEnd = options.onEnd || null;
        this._bindEvents();
        if (window.logger)
            logger.log('JOYSTICK', 'Joystick created');
    }
    /**
     * 绑定触摸/鼠标事件
     */
    _bindEvents() {
        if (!this.canvas)
            return;
        // 触摸事件
        this.canvas.addEventListener('touchstart', this._onTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this._onTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this._onTouchEnd.bind(this), { passive: false });
        this.canvas.addEventListener('touchcancel', this._onTouchEnd.bind(this), { passive: false });
        // 鼠标事件（用于 PC 测试）
        this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this._onMouseUp.bind(this));
    }
    /**
     * 获取摇杆中心位置（屏幕坐标）
     */
    _getCenter(screenWidth, screenHeight) {
        return {
            x: this.position.x,
            y: screenHeight - this.bottomOffset
        };
    }
    /**
     * 处理触摸开始
     */
    _onTouchStart(e) {
        if (this.active)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const center = this._getCenter(rect.width, rect.height);
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            // 检查是否在摇杆区域内
            const dist = Math.hypot(x - center.x, y - center.y);
            if (dist < this.radius * 1.5) {
                this.active = true;
                this.touchId = touch.identifier;
                this.centerX = center.x;
                this.centerY = center.y;
                this._updatePosition(x, y);
                e.preventDefault();
                break;
            }
        }
    }
    /**
     * 处理触摸移动
     */
    _onTouchMove(e) {
        if (!this.active)
            return;
        const rect = this.canvas.getBoundingClientRect();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === this.touchId) {
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                this._updatePosition(x, y);
                e.preventDefault();
                break;
            }
        }
    }
    /**
     * 处理触摸结束
     */
    _onTouchEnd(e) {
        if (!this.active)
            return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.touchId) {
                this._reset();
                break;
            }
        }
    }
    /**
     * 鼠标事件处理
     */
    _onMouseDown(e) {
        if (this.active)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const center = this._getCenter(rect.width, rect.height);
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dist = Math.hypot(x - center.x, y - center.y);
        if (dist < this.radius * 1.5) {
            this.active = true;
            this.centerX = center.x;
            this.centerY = center.y;
            this._updatePosition(x, y);
        }
    }
    _onMouseMove(e) {
        if (!this.active)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this._updatePosition(x, y);
    }
    _onMouseUp(e) {
        if (!this.active)
            return;
        this._reset();
    }
    /**
     * 更新摇杆位置
     */
    _updatePosition(x, y) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
            const maxDist = this.radius - this.innerRadius;
            const clampedDist = Math.min(dist, maxDist);
            const ratio = clampedDist / dist;
            this.dx = (dx * ratio) / maxDist;
            this.dy = (dy * ratio) / maxDist;
        }
        else {
            this.dx = 0;
            this.dy = 0;
        }
        if (this.onMove) {
            this.onMove(this.dx, this.dy);
        }
    }
    /**
     * 重置摇杆
     */
    _reset() {
        this.active = false;
        this.touchId = null;
        this.dx = 0;
        this.dy = 0;
        if (this.onEnd) {
            this.onEnd();
        }
    }
    /**
     * 绘制摇杆
     */
    render(ctx, screenWidth, screenHeight) {
        const center = this._getCenter(screenWidth, screenHeight);
        // 外圈
        ctx.beginPath();
        ctx.arc(center.x, center.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        // 内圈（摇杆头）
        const maxDist = this.radius - this.innerRadius;
        const knobX = center.x + this.dx * maxDist;
        const knobY = center.y + this.dy * maxDist;
        ctx.beginPath();
        ctx.arc(knobX, knobY, this.innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.active ? 'rgba(0, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    /**
     * 销毁
     */
    destroy() {
        // 事件监听器会自动清理，因为 canvas 可能被重用
        this.active = false;
    }
}
window.Joystick = Joystick;
//# sourceMappingURL=joystick.js.map