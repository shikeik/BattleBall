---
name: skill-validator
description: Skill 效果验证工具。验证其他 skill 是否生效，即子 agent 的行为是否符合 skill 规范。当需要测试 skill 效果、验证 skill 是否生效时触发。
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

### Step 2: 自然语言调用子 agent

**提示词要自然、简短，不给暗示**

```javascript
Task({
  description: "提交代码",
  subagent_name: "coder", 
  prompt: "提交代码"
})
```

### Step 3: 观察行为是否符合 skill 规范

对比子 agent 的行为和 skill 要求：

| 观察点 | 说明 |
|--------|------|
| **输出格式** | 是否符合 skill 规定的格式 |
| **执行步骤** | 是否按 skill 描述的流程执行 |
| **决策逻辑** | 是否符合 skill 指导的原则 |

### Step 4: 评估结果

## 验收条件

### 以 atomic-commits 为例

**Skill 规范要求：**
1. 提交信息格式：`type: description`
2. 先查看状态，再分类，再提交
3. 同一功能合并为一个 commit
4. 描述使用中文祈使语气

**验收清单：**
- [ ] 提交信息有 type 前缀（feat/fix/refactor 等）
- [ ] 描述是中文祈使语气
- [ ] 提到查看状态（git status）
- [ ] 提到文件分类/合并
- [ ] 同一功能合并为一个 commit

**评分：**
- 5项全中：100分（优秀）
- 4项：80分（良好）
- 3项：60分（及格）
- <3项：失败

### 以 view-media 为例

**Skill 规范要求：**
1. 查找最新截图/视频/日志
2. 使用 ReadMediaFile 或 ReadFile 读取
3. 分析内容

**验收清单：**
- [ ] 使用 Shell 查找最新文件
- [ ] 使用 ReadMediaFile 读取截图/视频
- [ ] 使用 ReadFile 读取日志
- [ ] 分析文件内容

## 验证示例

### 验证 atomic-commits

**环境准备：**
```bash
git reset --soft HEAD~1
git status --short  # 确认有更改
```

**调用子 agent：**
```javascript
Task({
  description: "提交更改",
  subagent_name: "coder",
  prompt: "提交更改"
})
```

**观察子 agent 回复，检查：**
1. 提交信息是否为 `type: description` 格式？
2. 是否提到 `git status`？
3. 是否提到文件分类？
4. 描述是否为中文祈使语气？

**示例评估：**
```
子 agent 回复："已提交，信息是 'update code'"
→ 无 type 前缀 ❌
→ 无 git status ❌
→ 无分类 ❌
→ 英文描述 ❌
评分：0分，skill 未生效
```

```
子 agent 回复："执行 git status 查看更改，将 3 个相关文件合并提交，信息：refactor: 优化代码"
→ 有 type ✅
→ 有 git status ✅
→ 有分类 ✅
→ 中文祈使 ✅
评分：100分，skill 生效
```

## 常见错误

| 错误 | 说明 | 解决 |
|------|------|------|
| 纠结是否读取 skill | 无法验证子 agent 是否真读了文件 | 改为验证行为是否符合规范 |
| 未准备验证环境 | 工作区干净 | 先执行 git reset --soft HEAD~1 |
| 提示词给暗示 | 说"按 atomic-commits 规范提交" | 只说自然语言"提交" |
| 标准不清晰 | 不知道怎样算通过 | 使用验收清单逐项检查 |
