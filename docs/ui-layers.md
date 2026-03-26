# UI 层级规范文档

## 设计原则

1. **集中管理**：所有UI层级在统一位置定义，禁止分散硬编码
2. **分层明确**：每层有明确的职责范围，避免重叠冲突
3. **预留空间**：每层之间预留gap，方便后续插入新层级

## 层级架构

```
层级值    用途                    组件
─────────────────────────────────────────────────────────
0         游戏画布                #gameCanvas

1000      游戏世界UI              准星、指示器、血条

2000      游戏HUD                 分数、护盾、波次

3000      武器系统UI              武器槽位、能量条、效果

4000      交互控件                摇杆、按钮

5000      弹窗/面板               设置面板、难度面板

9000      全屏遮罩                开始界面、游戏结束

10000     调试工具                日志面板、性能监控

10001     顶部工具栏              工具栏按钮
```

## 使用规范

### 1. 禁止直接写死 z-index

❌ 错误：
```javascript
element.style.zIndex = '100';
```

✅ 正确：
```javascript
element.style.zIndex = UILayers.HUD;
```

### 2. 需要偏移时使用 getAbove/getBelow

```javascript
// 在HUD层之上1层
element.style.zIndex = UILayers.getAbove(UILayers.HUD);

// 在摇杆层之下2层
element.style.zIndex = UILayers.getBelow(UILayers.CONTROLS, 2);
```

### 3. 新组件层级申请流程

1. 查看本文档确定合适的层级范围
2. 如果现有层级不满足，申请新的层级常量
3. 更新本文档

## 各层详细说明

### LAYER_GAME (0)
游戏画布本身，不放置UI元素

### LAYER_WORLD_UI (1000)
游戏世界中的3D投影UI
- 准星 (crosshair)
- 地面指示器 (indicator)
- 敌人血条

### LAYER_HUD (2000)
游戏主HUD，始终显示
- 分数 (score)
- 护盾条 (health-bar)
- 波次 (wave)
- 位置坐标 (pos-x, pos-z)

### LAYER_WEAPON (3000)
武器系统相关UI
- 能量条
- 武器槽位
- 道具效果图标

### LAYER_CONTROLS (4000)
玩家交互控件
- 左侧移动摇杆
- 右侧瞄准摇杆
- 射击按钮

### LAYER_PANEL (5000)
弹窗和面板
- 设置面板
- 难度选择面板
- 确认对话框

### LAYER_START_SCREEN (8000)
开始界面
- 开始界面 (startScreen)
- 难度选择面板

### LAYER_SHIP_VIEWER (8500)
飞船预览器（必须在开始界面之上）
- 飞船预览器容器 (ship-viewer-container)
- 预览器控制按钮

### LAYER_GAME_OVER (9000)
游戏结束界面（必须在最上层）
- 游戏结束界面 (gameOverScreen)

### LAYER_DEBUG (10000)
开发和调试工具
- 日志面板
- 性能监控面板

### LAYER_TOOLBAR (10001)
顶部工具栏，最高层级
- 返回按钮
- 全屏按钮
- 日志按钮
- 设置按钮
- 性能按钮

## CSS 变量定义

```css
:root {
    --layer-game: 0;
    --layer-world-ui: 1000;
    --layer-hud: 2000;
    --layer-weapon: 3000;
    --layer-controls: 4000;
    --layer-panel: 5000;
    --layer-screen: 9000;
    --layer-debug: 10000;
    --layer-toolbar: 10001;
}
```

## JavaScript API

```javascript
// 获取层级值
UILayers.GAME        // 0
UILayers.WORLD_UI    // 1000
UILayers.HUD         // 2000
UILayers.WEAPON      // 3000
UILayers.CONTROLS    // 4000
UILayers.PANEL       // 5000
UILayers.SCREEN      // 9000
UILayers.DEBUG       // 10000
UILayers.TOOLBAR     // 10001

// 相对层级计算
UILayers.getAbove(baseLayer, offset = 1)
UILayers.getBelow(baseLayer, offset = 1)

// 应用层级到元素
UILayers.apply(element, layer)
```

## 历史记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-03-15 | 1.0 | 初始版本，统一0.4.x UI层级 |
