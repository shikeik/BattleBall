# Battle Ball 游戏框架

一个干净的游戏开发框架，保留通用的基础功能，可用于快速开发新游戏。

---

## 项目结构

```
battle-ball/
├── index.html              # 入口文件（含防缓存逻辑）
├── README.md               # 本文件
├── AGENTS.md               # 项目规范（缩进、日志等）
├── TODO.md                 # 任务记录
├── deploy.sh               # 部署脚本
├── indentFix.sh            # 缩进修复脚本（Tab 规范）
├── css/
│   ├── main.css            # 主样式入口
│   └── modules/
│       ├── reset.css       # CSS 重置
│       ├── layout.css      # 布局系统
│       └── layers.css      # UI 层级变量
├── js/
│   ├── toolbar.js          # 顶部工具栏系统
│   ├── script-loader.js    # 动态脚本加载器
│   ├── loading-screen.js   # 加载界面
│   ├── perf-monitor.js     # 性能监控（FPS/内存）
│   ├── ui/
│   │   └── layers.js       # UI 层级管理
│   └── logger/             # 日志系统
│       ├── config.js       # 日志配置
│       ├── core.js         # 核心功能
│       ├── ui.js           # 日志面板 UI
│       └── index.js        # 入口
└── docs/                   # 文档目录
```

---

## 核心功能

### 1. Toolbar 工具栏

顶部可滑动的工具栏，支持分页。

**默认按钮：**
- ← 返回：关闭面板（可自定义）
- ⛶ 全屏：切换全屏模式
- ◇ 日志：显示/隐藏日志面板
- ⚙ 设置：显示设置面板（可自定义）
- 📊 性能：显示 FPS 和内存使用
- 🐛 调试：显示调试面板（可自定义）

**使用方式：**
```javascript
// 工具栏自动初始化，通过 window.toolbar 访问
window.toolbar.addToolButton({
    id: 'myBtn',
    icon: '🎮',
    page: 0,
    onClick: () => console.log('clicked')
});
```

---

### 2. Logger 日志系统 ⭐

**这是最重要的调试工具！** 手机环境看不到 `console.log`，必须使用 logger。

#### 基本用法

```javascript
// ✅ 正确 - 使用 logger
if (window.logger) {
    logger.log('TAG', '消息内容', { key: value });
}

// ❌ 错误 - 手机上看不到
console.log('message');
```

#### 日志标签（Tags）

日志支持标签分类，便于筛选：

```javascript
// 使用预定义标签
logger.log('game', '游戏开始');
logger.log('render', '渲染场景');
logger.log('input', '触摸事件', { x: 100, y: 200 });
logger.log('audio', '播放音效');
logger.log('perf', '性能数据');

// 自定义标签
logger.log('MY_TAG', '我的日志', { data: 123 });
```

#### 打开日志面板

1. 点击工具栏的 ◇ 按钮
2. 或按键盘快捷键（如果有配置）

#### 日志面板功能

- **筛选**：点击"筛选 ▼"按标签过滤
- **自动滚动**：AUTO:ON/OFF
- **保存**：导出日志到文件
- **清空**：清空当前日志

#### 添加自定义标签

在 `js/logger/config.js` 中添加：

```javascript
const DEFAULT_LOG_TAGS = {
    MY_TAG: {
        label: '🔥 我的标签',
        subs: ['default'],
        color: '#ff6600'
    }
};
```

---

### 3. ScriptLoader 脚本加载器

动态加载 JS 文件，支持进度回调。

**配置加载组：**
```javascript
// 在 js/script-loader.js 中添加
const SCRIPT_GROUPS = {
    myGame: [
        { name: 'Game Core', src: 'js/my-game/game.js', weight: 3 },
        { name: 'Player', src: 'js/my-game/player.js', weight: 2 },
    ]
};
```

**在 index.html 中注册加载任务：**
```javascript
loading.registerTask('My Game', async () => {
    await loader.loadBatch(SCRIPT_GROUPS.myGame, (p, s) => 
        loading.updateProgress(50 + p * 0.5, s)
    );
}, 50);
```

---

### 4. 防缓存系统

**原理：** URL 时间戳确保加载最新代码

**触发刷新的情况：**
1. **首次访问** - 自动添加时间戳 `?t=xxx`
2. **版本号变化** - 修改 `BUILD_VERSION` 强制刷新
3. **主动刷新** - F5/刷新按钮且超过 5 秒

**使用方式：**
```javascript
// 正常开发无需修改，系统自动处理
window.BUILD_VERSION = "1.0.0.0";  // 版本号（可选，用于标识）
```

**手动强制刷新：**
- 修改 `BUILD_VERSION` 值，或
- 在 URL 后添加 `?t=123456`（任意数字）

---

### 5. UI 层级系统

使用 `UILayers` 常量避免 z-index 冲突：

```javascript
// ✅ 正确
element.style.zIndex = UILayers.HUD;
element.style.zIndex = UILayers.getAbove(UILayers.TOOLBAR);

// ❌ 错误
element.style.zIndex = 9999;
```

**层级列表：**
- `UILayers.GAME` (0) - 游戏画布
- `UILayers.HUD` (2000) - 游戏 HUD
- `UILayers.CONTROLS` (4000) - 交互控件
- `UILayers.PANEL` (5000) - 弹窗/面板
- `UILayers.DEBUG` (10000) - 调试工具
- `UILayers.TOOLBAR` (10001) - 顶部工具栏

---

## 开发新游戏步骤

1. **复制框架**
   ```bash
   cp -r battle-ball my-new-game
   cd my-new-game
   ```

2. **修改版本号（可选）**
   - 编辑 `index.html` 中的 `BUILD_VERSION` 标识版本

3. **添加游戏脚本**
   - 在 `js/` 下创建新目录（如 `js/my-game/`）
   - 在 `SCRIPT_GROUPS` 中注册
   - 在 `loading.onComplete` 中初始化

4. **添加游戏 UI**
   - 在 `index.html` 的 `#ui-layer` 中添加元素
   - 在 `css/` 中添加样式

5. **使用日志调试**
   - 所有调试信息使用 `logger.log()`
   - 点击工具栏 ◇ 按钮查看日志

---

## 项目规范

### 缩进规范
- **使用 Tab 缩进**，禁止空格
- 运行 `./indentFix.sh` 自动修复

### 日志规范
- **禁止 `console.log`**，必须使用 `logger.log()`
- 添加 `if (window.logger)` 检查

### 代码示例
```javascript
// ✅ 正确
if (window.logger) {
    logger.log('GAME', 'player move', { x, y });
}

// ❌ 错误
console.log('player move', x, y);
```

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `AGENTS.md` | 项目规范（给 AI 看的） |
| `TODO.md` | 任务清单 |
| `deploy.sh` | 部署脚本 |
| `indentFix.sh` | 缩进修复脚本 |

---

## 注意事项

1. **手机调试必须使用 logger**，console.log 看不到
2. **防缓存自动处理**，首次访问和刷新时自动加时间戳
3. **使用 UILayers** 管理 z-index
4. **运行 indentFix.sh** 保持缩进规范
