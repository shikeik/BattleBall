# 游戏代码清理 TODO

## 待办任务

- [x] 🔴 测试待办管理功能
- [ ] 🟡 验证功能完成

## 目标
清空当前游戏的业务代码，保留可复用的基础框架，为下一个游戏做准备。

## 保留项（核心框架）

### 1. Toolbar 工具栏系统
- `js/toolbar.js` - 顶部工具栏组件
- 分页滑动功能
- 全屏切换、日志、设置、调试面板

### 2. 动态脚本加载系统
- `js/script-loader.js` - 脚本加载器
- `js/loading-screen.js` - 加载界面
- `index.html` 中的加载流程框架

### 3. 防缓存系统
- `index.html` 中的 `BUILD_VERSION` 和 `CACHE_BUSTER` 逻辑
- URL 时间戳刷新机制

### 4. 基础 UI 层级系统
- `js/ui/layers.js` - UI 层级管理

### 5. 日志系统
- `js/logger/` 目录下的日志模块

### 6. 基础 CSS 框架
- `css/main.css` - 主样式入口
- `css/modules/layers.css` - 层级样式
- `css/modules/layout.css` - 布局样式

---

## 清理清单（需要删除的业务代码）

### JS 文件 - 游戏业务逻辑

#### 核心游戏逻辑（全部删除）
- [ ] `js/game.js` - 游戏主类
- [ ] `js/main.js` - 游戏入口
- [ ] `js/state.js` - 游戏状态管理
- [ ] `js/systems.js` - 游戏系统
- [ ] `js/config.js` - 游戏配置

#### 实体系统（全部删除）
- [ ] `js/entities.js` - 实体管理
- [ ] `js/entities/entity-base.js` - 实体基类
- [ ] `js/entities/player-factory.js` - 玩家工厂
- [ ] `js/entities/enemy-factory.js` - 敌人工厂
- [ ] `js/entities/bullet-factory.js` - 子弹工厂
- [ ] `js/entities/environment-factory.js` - 环境工厂

#### 特效系统（全部删除）
- [ ] `js/effects.js` - 特效管理
- [ ] `js/effects/effect-base.js` - 特效基类
- [ ] `js/effects/trail-effect.js` - 拖尾特效
- [ ] `js/effects/shockwave-effect.js` - 冲击波
- [ ] `js/effects/beam-effect.js` - 光束
- [ ] `js/effects/spark-effect.js` - 火花
- [ ] `js/effects/shield-effect.js` - 护盾

#### 武器系统（全部删除）
- [ ] `js/weapons/weapon-base.js` - 武器基类
- [ ] `js/weapons/weapon-pulse.js` - 脉冲武器
- [ ] `js/weapons/weapon-scatter.js` - 散射武器
- [ ] `js/weapons/weapon-laser.js` - 激光武器
- [ ] `js/weapons/weapon-missile.js` - 导弹武器
- [ ] `js/weapons/weapon-manager.js` - 武器管理器
- [ ] `js/ui/weapon-hud.js` - 武器 HUD

#### 道具系统（全部删除）
- [ ] `js/items/item-base.js` - 道具基类
- [ ] `js/items/item-types.js` - 道具类型
- [ ] `js/items/item-manager.js` - 道具管理器

#### 音频系统（全部删除）
- [ ] `js/audio-manager.js` - 音频管理器
- [ ] `js/audio/bgm-manager.js` - BGM 管理
- [ ] `js/audio/sfx-manager.js` - 音效管理
- [ ] `js/audio/music-data.js` - 音乐数据

#### 输入系统（全部删除）
- [ ] `js/input.js` - 输入管理
- [ ] `js/joystick.js` - 摇杆
- [ ] `js/aim.js` - 瞄准系统
- [ ] `js/aim-ui.js` - 瞄准 UI

#### 核心控制器（全部删除）
- [ ] `js/core/camera-controller.js` - 相机控制
- [ ] `js/core/collision-system.js` - 碰撞系统
- [ ] `js/core/game-controller.js` - 游戏控制器
- [ ] `js/core/ship-viewer-controller.js` - 飞船预览器控制器

#### 辅助工具（全部删除）
- [ ] `js/angle-utils.js` - 角度工具
- [ ] `js/collision-helper.js` - 碰撞辅助
- [ ] `js/player-helper.js` - 玩家辅助
- [ ] `js/enemy-helper.js` - 敌人辅助
- [ ] `js/dispose-helper.js` - 资源释放辅助
- [ ] `js/particle-pool.js` - 粒子池
- [ ] `js/perf-monitor.js` - 性能监控
- [ ] `js/spaceship-generator.js` - 飞船生成器
- [ ] `js/ship-viewer.js` - 飞船预览器

### CSS 文件 - 游戏专用样式

#### 屏幕样式（全部删除）
- [ ] `css/screens/start-screen.css` - 开始界面
- [ ] `css/screens/difficulty-panel.css` - 难度面板
- [ ] `css/screens/ship-viewer.css` - 飞船预览
- [ ] `css/screens/game-over.css` - 游戏结束

#### 模块样式（部分删除）
- [ ] `css/modules/hud.css` - HUD 样式
- [ ] `css/modules/controls.css` - 控制样式（摇杆、按钮等）
- [ ] `css/modules/effects.css` - 特效样式
- [ ] `css/modules/panels.css` - 面板样式
- [ ] `css/modules/weapon-hud.css` - 武器 HUD 样式
- [ ] `css/modules/components.css` - 组件样式（视内容而定）

### HTML 清理

#### index.html 中的游戏专用元素
- [ ] 清理 `<title>` 中的游戏名称
- [ ] 清理游戏专用 UI 结构（HUD、开始界面、游戏结束界面等）
- [ ] 清理游戏专用加载任务（武器、道具、实体、特效等）
- [ ] 保留加载流程框架，简化加载任务

### 其他文件
- [ ] `test/` 目录下的测试文件
- [ ] `test-angle.html` - 角度测试页面
- [ ] `REFACTOR_SUMMARY.md` - 重构总结（可删除或归档）

---

## 清理后保留的文件结构

```
battle-ball/
├── index.html              # 保留框架，清理游戏专用内容
├── AGENTS.md               # 项目规范
├── TODO.md                 # 本文件
├── deploy.sh               # 部署脚本
├── indentFix.sh            # 缩进修复脚本
├── css/
│   ├── main.css            # 清理后的主样式
│   └── modules/
│       ├── reset.css       # 重置样式
│       ├── layout.css      # 布局样式
│       └── layers.css      # 层级样式
├── js/
│   ├── toolbar.js          # 工具栏系统
│   ├── script-loader.js    # 脚本加载器
│   ├── loading-screen.js   # 加载界面
│   ├── ui/
│   │   └── layers.js       # UI 层级
│   └── logger/             # 日志系统
│       ├── config.js
│       ├── core.js
│       ├── ui.js
│       └── index.js
└── docs/                   # 文档目录
```

---

## 清理后预期结果

### 1. 文件结构

清理后项目将变成一个**干净的游戏开发框架**，只包含基础功能：

```
battle-ball/
├── index.html              # ~80行（原300+行）
├── AGENTS.md               # 项目规范
├── TODO.md                 # 本文件
├── deploy.sh               # 部署脚本
├── indentFix.sh            # 缩进修复脚本
├── css/
│   ├── main.css            # 只导入基础样式
│   └── modules/
│       ├── reset.css       # CSS重置
│       ├── layout.css      # 基础布局
│       └── layers.css      # 层级变量
├── js/
│   ├── toolbar.js          # 工具栏系统 (~674行)
│   ├── script-loader.js    # 脚本加载器 (~190行)
│   ├── loading-screen.js   # 加载界面
│   ├── ui/
│   │   └── layers.js       # UI层级管理 (~148行)
│   └── logger/             # 日志系统
│       ├── config.js       # 日志配置 (~156行)
│       ├── core.js         # 核心功能
│       ├── ui.js           # UI界面
│       └── index.js        # 入口
└── docs/                   # 文档目录
```

### 2. index.html 预期内容

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
	<!-- 防缓存系统 -->
	<script>
		(function() {
			window.BUILD_VERSION = "1.0.0.0";
			// ... 缓存逻辑 ...
		})();
	</script>
	<title>New Game</title>
	<link rel="stylesheet" href="css/main.css">
</head>
<body>
	<canvas id="gameCanvas"></canvas>
	<div id="ui-layer" style="visibility: hidden;">
		<!-- 空的 UI 容器，等待新游戏填充 -->
	</div>

	<script>
	// 动态脚本加载框架
	(function() {
		const cacheBuster = window.CACHE_BUSTER || Date.now();
		
		async function main() {
			// 加载 toolbar、logger、script-loader
			// 加载完成后初始化 toolbar
		}
		main();
	})();
	</script>
</body>
</html>
```

### 3. 运行效果

打开 `index.html` 后：

1. **防缓存生效** - URL 自动添加 `?v=1.0.0.0&t=xxx` 参数
2. **加载界面** - 显示加载进度（如果有配置加载任务）
3. **工具栏显示** - 顶部出现可滑动的工具栏
   - 第一页：返回、全屏、日志、设置、性能、调试按钮
   - 可左右滑动翻页
4. **日志系统** - 点击日志按钮可打开日志面板
5. **空白画布** - 中间是空的 canvas，等待新游戏逻辑

### 4. 开发新游戏的起点

清理后的框架提供了：

| 功能 | 使用方式 |
|------|----------|
| **Toolbar** | `new Toolbar()` 或直接使用 `window.toolbar` |
| **日志** | `if (window.logger) logger.log('TAG', 'message', data)` |
| **UI 层级** | `UILayers.GAME`, `UILayers.HUD` 等常量 |
| **脚本加载** | `SCRIPT_GROUPS` 配置 + `ScriptLoader.loadBatch()` |
| **防缓存** | 修改 `BUILD_VERSION` 自动刷新 |

新游戏只需：
1. 在 `index.html` 中添加游戏专用 UI 结构
2. 在 `SCRIPT_GROUPS` 中注册新游戏的 JS 文件
3. 在 `loading.onComplete` 中初始化新游戏
4. 按需添加新的 CSS 样式

---

## 下一步行动

1. **确认清理范围** - 检查本清单是否需要调整
2. **备份重要代码** - 如需保留某些业务逻辑片段，提前备份
3. **执行清理** - 按清单逐项删除
4. **验证框架** - 确保保留的基础功能正常工作
5. **初始化新项目** - 基于清理后的框架开始新游戏开发
