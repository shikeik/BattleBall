---
name: commit-assistant
description: Git 提交助手。当用户说"提交"、"commit"、"提交代码"时触发。按 Atomic Commits 原则完成提交。
---

# Atomic Commits 提交助手

## 提交流程

### Step 1: 查看更改
```bash
git status --short    # 查看修改的文件列表
git diff --stat       # 查看更改统计
```

### Step 2: 分类提交

**同一功能的文件 → 一个 commit**
```bash
# 示例：技能重命名 + frontmatter 更新（同一功能）
git add .kimi/skills/commit-assistant/ .kimi/skills/git-history-rewrite/
git add .kimi/skills/code-quality-refactoring/ .kimi/skills/view-media/
git commit -m "refactor: 重命名技能目录并添加规范 frontmatter"
```

**不同功能的文件 → 分开提交**
```bash
# 示例：功能 A 和功能 B 分开
git add src/feature-a/
git commit -m "feat: 实现功能 A"

git add src/feature-b/
git commit -m "feat: 实现功能 B"
```

### Step 3: 提交信息格式

```
<type>: <description>
```

| Type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `refactor` | 代码重构（无功能变更）|
| `test` | 测试相关 |
| `chore` | 构建/工具配置 |
| `style` | 代码格式（空格、缩进）|
| `perf` | 性能优化 |

**描述规范：**
- 中文描述，祈使语气（"添加"而非"添加了"）
- 不超过 50 字符
- 结尾不加句号

## 提交粒度判断

| 情况 | 处理 |
|------|------|
| 同一功能的多文件 | 一个 commit |
| 功能 + 相关测试/文档 | 一个 commit |
| 多个不相关功能 | 拆分为多个 commits |
| 功能 vs 重构 | 分开提交 |
| 功能 vs 格式化 | 分开提交 |

## 常用命令

```bash
git add <file>           # 添加指定文件
git add -p               # 交互式选择修改部分
git commit -m "type: 描述"
git log --oneline -10    # 查看最近提交
```
