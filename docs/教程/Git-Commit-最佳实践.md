# Git Commit 最佳实践

> 本文整理业界 Git 提交最佳实践，供项目参考。

---

## Atomic Commits（原子提交）

**定义**：一个 commit = 一个完整的逻辑变更

**特征**：
- 单一职责：只解决一个问题或实现一个功能
- 自包含：不依赖其他 commit 也能理解
- 可回滚：单独 revert 不会破坏其他功能

**示例**：

```
✅ 好的 Atomic Commit：
"feat: 实现用户登录功能"
- 包含：登录接口 + 单元测试 + API 文档

❌ 不好的非 Atomic Commit：
"update: 修复 bug 并优化性能并更新依赖"
- 混合了三个不相关的变更
```

---

## Commit Granularity（提交粒度）

### 何时合并

| 情况 | 处理 | 示例 |
|------|------|------|
| 碎片化变更 | 合并到相关 commit | 格式化代码随功能一起提交 |
| 同一功能的多文件 | 一个 commit | 登录功能：Controller + Service + Test |

### 何时拆分

| 情况 | 处理 | 示例 |
|------|------|------|
| 多个不相关功能 | 拆分为多个 commits | 登录功能 vs 订单功能 |
| 功能 vs 重构 | 分开提交 | 新功能 + 代码重构（分两次） |
| 功能 vs 格式化 | 分开提交 | 功能变更 + 全文件格式化（分两次） |

### 粒度参考

| 大小 | 特征 | 建议 |
|------|------|------|
| 太小 | 碎片化，无意义 | 合并相关变更 |
| 适中 | 聚焦，单一目的 | 推荐 |
| 太大 | 多主题混杂 | 拆分 |

---

## 提交信息格式

### Conventional Commits

```
<type>(<scope>): <subject>

[body]

[footer]
```

### 常用 Type

| Type | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加用户注册` |
| `fix` | Bug 修复 | `fix: 修复登录失效问题` |
| `docs` | 文档更新 | `docs: 更新 API 文档` |
| `refactor` | 代码重构 | `refactor: 优化查询性能` |
| `test` | 测试相关 | `test: 添加单元测试` |
| `chore` | 构建/工具 | `chore: 更新依赖版本` |
| `style` | 代码格式 | `style: 统一缩进` |
| `perf` | 性能优化 | `perf: 减少内存占用` |

### Subject 规范

- 使用祈使句（"Add" 而非 "Added"）
- 首字母不大写
- 结尾不加句号
- 不超过 50 字符

```
✅ "feat: add user authentication"
❌ "feat: Added user authentication."
```

---

## 提交频率

**原则**：Commit early, commit often

| 场景 | 建议 |
|------|------|
| 完成一个小功能 | 立即提交 |
| 切换分支前 | 提交或 stash |
| 每天结束 | 推送 commits |
| 长时间工作 | 阶段性 commit（可后续 squash） |

---

## 最佳实践 vs 反例

### ✅ 好的实践

```
feat: implement password reset

- Add password reset endpoint
- Create email validation
- Add rate limiting for security

Closes #123
```

```
refactor: extract payment service

Move payment logic from OrderController
to dedicated PaymentService for testability.
```

### ❌ 不好的实践

```
update

（无描述，无法知道做了什么）
```

```
fix bug

（太模糊，什么 bug？）
```

```
feat: add login AND fix logout AND update docs

（一个 commit 做三件事，非 Atomic）
```

---

## 工具技巧

### 选择性提交

```bash
# 交互式选择修改部分
git add -p

# 暂存不想立即提交的内容
git stash
```

### 修改提交历史

```bash
# 合并多个 commits
git rebase -i HEAD~3

# 修改最后一次提交
git commit --amend
```

---

## 参考来源

- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Atomic Commits - PullChecklist](https://www.pullchecklist.com/posts/git-commit-best-practices)
- [Git Commit Best Practices - LabEx](https://labex.io/tutorials/git-how-to-improve-git-commit-guidelines-451802)
- [Commit Often, Perfect Later - GitBestPractices](https://sethrobertson.github.io/GitBestPractices/)
- [Splitting a Commit - ThoughtBot](https://thoughtbot.com/blog/splitting-a-commit)
