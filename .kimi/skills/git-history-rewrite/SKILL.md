---
name: git-history-rewrite
description: Git 历史提交信息修正工具。用于修改已存在的提交信息，包括：中英文转换、修正错误描述、重写历史提交、amend 最近一次提交。当用户说"修正提交信息"、"修改历史提交"、"提交信息改中文"、"amend commit"或需要修改已有提交时触发。
---

# Git 历史提交信息修正

## 适用场景

当用户需要修改已存在的提交信息时使用：
- 中英文转换（如将英文提交信息改为中文）
- 修正错误描述
- 重写历史提交
- 合并或拆分提交

## 禁用方法

以下方法在本项目中不推荐使用：

| 方法 | 禁用原因 |
|------|----------|
| `git rebase -i` | 需要交互式编辑器，在脚本环境难处理 |
| `git filter-branch --msg-filter` | `$GIT_COMMIT` 变量在 filter 中获取不到当前提交，复杂替换逻辑容易出错 |
| `git filter-repo` | 需要额外安装，环境不一定有 |

## 推荐方案

### 情况一：修改最近一次提交

```bash
git commit --amend -m "中文标题

- 中文内容第一行
- 中文内容第二行"
```

### 情况二：修改历史提交（cherry-pick + amend）

**Step 1: 查找目标提交 hash**
```bash
git log --format="%H %s" -10
```

**Step 2: 切换到要修改的提交**
```bash
git checkout <commit_hash>
```

**Step 3: 修改提交信息**
```bash
git commit --amend -m "中文标题

- 中文内容1
- 中文内容2"
```

**Step 4: 逐个 cherry-pick 后续提交并修改**
```bash
git cherry-pick <next_commit_hash_1>
git commit --amend -m "中文标题1..."

git cherry-pick <next_commit_hash_2>
git commit --amend -m "中文标题2..."

# 继续直到最后一个提交
```

**Step 5: 重置分支指针**
```bash
git branch -f <branch_name> HEAD
git checkout <branch_name>
```

## 完整示例

修改最近 4 条提交为中文：

```bash
# 1. 查看提交历史
git log --format="%H %s" -4
# 输出：
# d34115c 英文标题4
# 459f91a 英文标题3
# 4f10812 英文标题2
# 25f9d56 英文标题1

# 2. 从最早的提交开始
git checkout 25f9d56

# 3. 修改第一个提交
git commit --amend -m "中文标题1

- 中文内容说明"

# 4. cherry-pick 并修改后续提交
git cherry-pick 4f10812
git commit --amend -m "中文标题2

- 中文内容说明"

git cherry-pick 459f91a
git commit --amend -m "中文标题3

- 中文内容说明"

git cherry-pick d34115c
git commit --amend -m "中文标题4

- 中文内容说明"

# 5. 更新分支
git branch -f webgpu-demo HEAD
git checkout webgpu-demo
```

## 注意事项

1. **操作前确保有备份**：修改历史会改变 commit hash，建议先创建备份分支
2. **强制推送**：如果已推送到远程，需要 `git push -f`
3. **逐个处理**：每个提交都需要单独 cherry-pick 和 amend，不能批量处理

## 常见错误

### 错误：使用 filter-branch 的 $GIT_COMMIT 变量
```bash
# 错误示例：$GIT_COMMIT 在 --msg-filter 中为空或不正确
git filter-branch --msg-filter '
  msg=$(git log -1 --format="%B" "$GIT_COMMIT")  # ❌ 错误！
  # ...
'
```

### 正确：使用 cherry-pick + amend
```bash
git checkout <commit>
git commit --amend -m "新信息"  # ✅ 正确
```
