---
name: git-history-rewrite
description: Git 历史提交信息修正工具。用于修改已存在的提交信息，包括：中英文转换、修正错误描述、重写历史提交、amend 最近一次提交。当用户说"修正提交信息"、"修改历史提交"、"提交信息改中文"、"amend commit"、"修改提交历史"或需要修改已有 commit 时触发。
---

# Git 历史提交信息修正

## 适用场景

- 中英文转换（英文提交信息改为中文）
- 修正错误或不清晰的描述
- 合并或拆分提交
- 修改最近一次提交（amend）

## 禁用方法

| 方法 | 禁用原因 |
|------|----------|
| `git rebase -i` | 需要交互式编辑器，脚本环境难处理 |
| `git filter-branch` | `$GIT_COMMIT` 变量获取不到当前提交 |
| `git filter-repo` | 需要额外安装 |

## 推荐方案：cherry-pick + amend

### 修改最近一次提交

```bash
git commit --amend -m "新标题

- 新内容第一行
- 新内容第二行"
```

### 修改历史提交

**Step 1: 查找提交 hash**
```bash
git log --format="%H %s" -10
```

**Step 2: 切换到目标提交**
```bash
git checkout <commit_hash>
```

**Step 3: 修改提交信息**
```bash
git commit --amend -m "新标题

- 新内容"
```

**Step 4: cherry-pick 后续提交**
```bash
git cherry-pick <next_commit_hash>
git commit --amend -m "保持或修改标题"
```

**Step 5: 重置分支指针**
```bash
git branch -f <branch_name> HEAD
git checkout <branch_name>
```

## 完整示例

修改最近 3 条提交为中文：

```bash
# 查看历史
git log --format="%H %s" -3
# abc123 fix bug
# def456 add feature  
# ghi789 update docs

# 从最早的开始
git checkout ghi789
git commit --amend -m "docs: 更新文档"

git cherry-pick def456
git commit --amend -m "feat: 添加新功能"

git cherry-pick abc123
git commit --amend -m "fix: 修复 bug"

# 更新分支
git branch -f main HEAD
git checkout main
```

## 注意事项

1. **备份分支** - 修改前创建备份：`git branch backup-before-rewrite`
2. **强制推送** - 已推送到远程需要：`git push -f`
3. **逐个处理** - 每个提交单独 cherry-pick 和 amend

## 检查清单

- [ ] 已创建备份分支
- [ ] 知道所有需要修改的 commit hash
- [ ] 准备好新的提交信息
- [ ] 确认可以强制推送（如已推送到远程）
