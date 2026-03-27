---
name: skill-validator
description: Skill 效果验证工具。验证其他 skill 是否生效，即子 agent 的行为是否符合 skill 规范。当用户说"验证 skill"、"测试 skill"、"检查 skill 效果"或需要验证技能时触发。
---

# Skill 验证器

验证 skill 是否生效，即子 agent 的行为是否符合 skill 规范。

## 核心原则

**验证行为，不验证过程**

- ❌ 不纠结子 agent 是否读取了 skill 文件
- ✅ 只看子 agent 的行为是否符合 skill 规范

## 验证流程

### Step 1: 准备验证环境

**必须有待验证的更改！**

```bash
# 恢复上次提交，创建待提交更改
git reset --soft HEAD~1

# 确认有更改
git status --short
```

### Step 2: 读取被验证 skill 的 VALIDATION.md

每个 skill 都有自己的验收标准：
```bash
cat .kimi/skills/<skill-name>/VALIDATION.md
```

### Step 3: 自然语言调用子 agent

**提示词要自然、简短，不给暗示**

```javascript
Task({
  description: "提交代码",
  subagent_name: "coder", 
  prompt: "提交代码"
})
```

### Step 4: 按 VALIDATION.md 逐项验收

对比子 agent 的行为和验收清单：
- 触发词是否正确响应？
- 输出格式是否符合规范？
- 执行步骤是否正确？

### Step 5: 记录评分

根据 VALIDATION.md 的评分标准给出分数。

## 通用验收维度

如果被验证 skill 没有 VALIDATION.md，使用以下通用维度：

| 维度 | 检查项 | 权重 |
|------|--------|------|
| **触发响应** | 是否正确响应触发词 | 30% |
| **输出格式** | 是否符合 skill 规定的格式 | 30% |
| **执行步骤** | 是否按 skill 流程执行 | 25% |
| **决策逻辑** | 是否符合 skill 原则 | 15% |

## 验证示例

### 验证 atomic-commits

**Step 1: 准备环境**
```bash
git reset --soft HEAD~1
git status --short
```

**Step 2: 读取 VALIDATION.md**
```bash
cat .kimi/skills/atomic-commits/VALIDATION.md
```

**Step 3: 调用子 agent**
```javascript
Task({
  description: "提交更改",
  subagent_name: "coder",
  prompt: "提交更改"
})
```

**Step 4: 按清单验收**

假设 VALIDATION.md 要求：
- [ ] 提交信息有 type 前缀
- [ ] 提到 git status
- [ ] 按功能分类

观察子 agent 回复，逐项打勾。

**Step 5: 评分**

3/3 = 100分（优秀）

## 常见错误

| 错误 | 说明 | 解决 |
|------|------|------|
| 未准备验证环境 | 工作区干净 | 先执行 git reset --soft HEAD~1 |
| 提示词给暗示 | 说"按规范提交" | 只说自然语言"提交" |
| 无 VALIDATION.md | skill 没创建验收清单 | 先用 skill-creator 补创建 |
| 标准不清晰 | 不知道怎样算通过 | 严格按 VALIDATION.md 清单检查 |

## 检查清单

验证完成后：
- [ ] 准备了验证环境
- [ ] 读取了被验证 skill 的 VALIDATION.md
- [ ] 使用自然语言调用子 agent
- [ ] 按清单逐项验收
- [ ] 记录了评分
- [ ] 反馈验证结果
