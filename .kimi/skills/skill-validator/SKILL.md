---
name: skill-validator
description: Skill 效果验证工具。当用户说"验证某某技能"、"验证技能"、"测试技能"、"检查技能效果"时，首先读取本 skill 了解验证流程，然后指导你验证其他 skill 是否生效。
---

# Skill 验证器

**首先读取本文件（skill-validator/SKILL.md），了解验证流程。**

然后指导你验证其他 skill 是否生效。

## 核心原则

**你执行验证，不是子 agent**

- ❌ 不要告诉子 agent "验证 skill"
- ✅ 你制定测试计划，自然语言调用子 agent
- ✅ 你观察行为，自己验收总结

## 验证流程

### Step 1: 读取验证所需文件

**你读取：**
1. `skill-validator/SKILL.md`（本文件，了解验证流程）
2. 被验证 skill 的 `SKILL.md`（了解技能规范）
3. 被验证 skill 的 `VALIDATION.md`（了解验收标准）

### Step 2: Git 存档与创建临时分支

**验证前必须执行：**

1. **保存当前更改（如果有）：**
   ```bash
   git add -A
   git commit -m "chore: 验证前存档"
   ```

2. **创建临时分支：**
   ```bash
   git checkout -b test-validation
   ```

**这样可以在隔离环境验证，不破坏原分支。**

### Step 3: 制定测试计划

根据 VALIDATION.md 制定测试步骤：
- 确定要测试的触发词（如"提交"、"创建任务"）
- 确定测试顺序
- 准备验证环境

### Step 3: 依次调用子 agent 测试

**重要：每次只调用一个子 agent，完成后再下一个**

```javascript
// 测试 1：创建任务
Task({
  description: "创建任务",
  subagent_name: "coder",
  prompt: "创建任务"  // 自然语言，不提 skill
})
// 等待完成，观察结果

// 测试 2：查看任务
Task({
  description: "查看任务",
  subagent_name: "coder", 
  prompt: "查看待办"  // 自然语言，不提 skill
})
// 等待完成，观察结果
```

**禁止：同时调用多个子 agent！**

### Step 4: 你观察验收

对比子 agent 的行为和 skill 规范：
- 子 agent 是否自动读取了 skill？
- 输出格式是否符合规范？
- 执行步骤是否正确？

### Step 5: 你总结评分

根据 VALIDATION.md 的评分标准，给出最终评分。

### Step 6: Git 恢复与清理

**验证后必须执行：**

1. **切回原分支：**
   ```bash
   git checkout -  # 切回上一个分支，或手动指定原分支名
   ```
   
   或者先查看当前分支再切回：
   ```bash
   git branch  # 查看分支列表，找到原分支名
   git checkout <原分支名>
   ```

2. **删除临时分支：**
   ```bash
   git branch -D test-validation
   ```

3. **恢复存档（如果有临时提交）：**
   ```bash
   git reset --soft HEAD~1  # 软回滚，更改回到暂存区
   ```

**重要：**
- 使用 `--soft` 软回滚，保留更改
- **不要用 `--hard`，会丢失更改！**

## 关键区别

| 错误做法 | 正确做法 |
|---------|---------|
| 告诉子 agent "验证 skill" | 只说自然语言任务 |
| 给子 agent 测试清单 | 主 agent 自己掌握清单 |
| 让子 agent 输出验收报告 | 主 agent 自己总结 |
| 并行调用多个子 agent | 依次调用，一个一个来 |

## 验证示例

### 验证 atomic-commits

**Step 1: 读取文件**
- 读取 skill-validator/SKILL.md
- 读取 atomic-commits/SKILL.md
- 读取 atomic-commits/VALIDATION.md

**Step 2: 制定计划**
- 测试触发词："提交"
- 准备环境：git reset --soft HEAD~1

**Step 3: 调用子 agent**
```javascript
Task({
  description: "提交代码",
  subagent_name: "coder",
  prompt: "提交代码"  // 只说这四个字，不提 skill
})
```

**Step 4: 观察验收**
- 子 agent 是否说"读取了 atomic-commits skill"？
- 是否执行 git status？
- 提交信息格式是否正确？

**Step 5: 总结评分**
- 按 VALIDATION.md 打分
- 输出验证报告

## 常见错误

| 错误 | 说明 | 解决 |
|------|------|------|
| 提示词包含"skill" | 告诉子 agent 要验证 skill | 只说自然语言任务 |
| 给子 agent 测试清单 | 子 agent 按清单执行，不是自发行为 | 主 agent 自己掌握清单 |
| 并行调用 | 多个子 agent 同时运行 | 依次调用，等待完成 |
| 让子 agent 总结 | 无法判断是否是自发行为 | 主 agent 自己观察总结 |

## 检查清单

验证完成后：
- [ ] 读取了 skill-validator 本身
- [ ] 读取了被验证 skill 的 SKILL.md 和 VALIDATION.md
- [ ] **Git 已存档并创建临时分支**
- [ ] 制定了测试计划
- [ ] 依次调用子 agent（自然语言，不提 skill）
- [ ] 自己观察验收
- [ ] 自己总结评分
- [ ] **Git 已恢复并清理临时分支**
- [ ] 输出验证报告
