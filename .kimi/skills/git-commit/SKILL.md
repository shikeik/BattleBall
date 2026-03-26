---
name: git-commit
description: Battle Ball 项目 Git 提交助手。帮助用户按规范提交代码，支持 Atomic Commits 原则，自动分类和提交更改。
---

# Git Commit 助手

帮助用户按规范完成 Git 提交，遵循 Atomic Commits 原则。

## 提交规范

### 提交信息格式

```
<type>: <description>
```

**Type 类型：**

| Type | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加转屏自适应支持` |
| `fix` | Bug 修复 | `fix: 修复 canvas 尺寸更新问题` |
| `docs` | 文档更新 | `docs: 更新 API 文档` |
| `refactor` | 代码重构 | `refactor: 优化 Viewport 方向切换逻辑` |
| `test` | 测试相关 | `test: 添加单元测试` |
| `chore` | 构建/工具 | `chore: 更新工具条按钮布局` |
| `style` | 代码格式 | `style: 统一缩进` |
| `perf` | 性能优化 | `perf: 减少重绘次数` |

**描述规范：**
- 使用中文描述
- 简洁明了，不超过 50 字符
- 使用祈使语气（"添加" 而非 "添加了"）

### Atomic Commits 原则

- **单一职责**：一个 commit 只做一个逻辑变更
- **自包含**：不依赖其他 commit 也能理解
- **可回滚**：单独 revert 不会破坏其他功能

### 何时合并/拆分

| 情况 | 处理 |
|------|------|
| 同一功能的多文件 | 一个 commit |
| 多个不相关功能 | 拆分为多个 commits |
| 功能 vs 重构 | 分开提交 |

## 提交流程

### 1. 查看更改

```bash
git status          # 查看修改的文件
git diff --stat     # 查看更改统计
git diff <file>     # 查看具体更改
```

### 2. 分类提交

按功能点分组提交：

```bash
# 示例：Viewport 相关更改
git add js/screen/viewport.ts dist/screen/viewport.js
git commit -m "feat: Viewport 支持动态调整 world 尺寸"

# 示例：Screen 基类改进
git add js/screen/screen.ts dist/screen/screen.js
git commit -m "refactor: Screen 基类统一管理 canvas 尺寸和转屏逻辑"
```

### 3. 批量提交（相关改动）

同一功能点的多个文件一起提交：

```bash
# 示例：工具条全屏和转屏按钮分离
git add js/toolbar.js
git commit -m "feat: 工具条全屏和转屏按钮分离"

# 示例：子类简化（多个文件同一功能）
git add js/screens/battle-ball-screen.js js/screens/settings-screen.js js/screen/selection-screen.js
git commit -m "refactor: 简化 Screen 子类，移除重复的 canvas 更新逻辑"
```

## 常用命令

```bash
# 添加文件
git add <file>           # 添加指定文件
git add -p               # 交互式选择修改部分

# 提交
git commit -m "type: 描述"
git commit -am "type: 描述"  # 添加并提交已跟踪文件

# 查看
git log --oneline -10    # 查看最近 10 条提交
git show HEAD            # 查看最后一次提交

# 撤销
git restore <file>       # 恢复文件到上次提交状态
git commit --amend       # 修改最后一次提交
```

## 注意事项

1. **先 add 后 commit**：确保只提交需要的更改
2. **频繁提交**：完成一个小功能就提交
3. **清晰描述**：让其他人能从提交信息理解更改内容
4. **检查状态**：提交前运行 `git status` 确认更改
