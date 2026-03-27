---
name: skill-validator
description: Skill 效果验证工具。帮助验证其他 skill 是否能被正确触发和执行。当需要测试 skill 效果、验证 skill 是否生效、检查 skill 触发词是否正确时触发。
---

# Skill 验证器

验证其他 skill 是否被正确触发和执行。

## 核心原则

**不要给子 agent 任何暗示！**

- ❌ 错误："请先查看 skill 文件"
- ✅ 正确：只说自然语言任务，如"提交"

就像用户跟主 agent 对话一样自然。

## 验证流程

### Step 1: 准备验证环境

**关键：必须有待验证的更改！**

如果工作区干净，创建验证环境：

```bash
# 方式 1: 恢复上次提交（推荐）
git reset --soft HEAD~1

# 方式 2: 修改一个测试文件
echo "// test" >> js/some-file.js

# 确认有待提交的更改
git status --short
```

**验证环境检查清单：**
- [ ] `git status` 显示有待提交的文件
- [ ] 知道要验证哪个 skill
- [ ] 确认被验证的 skill 文件存在

### Step 2: 自然语言调用子 agent

**关键：提示词要自然、简短，不给暗示**

**示例 - 验证 atomic-commits：**
```javascript
Task({
  description: "提交代码",
  subagent_name: "coder", 
  prompt: "提交代码"
})
```

**示例 - 验证 view-media：**
```javascript
Task({
  description: "看截图",
  subagent_name: "coder",
  prompt: "看截图"
})
```

### Step 3: 观察子 agent 行为

看子 agent 的回复中是否：
1. **主动提到读取了 skill** - 如"我查看了 atomic-commits skill"
2. **按 skill 流程执行** - 如提交时先查看状态、分类、再提交
3. **输出符合 skill 规范** - 如提交信息格式正确

### Step 4: 评估结果

## 验收条件

### 必要条件（必须全部通过）

| 条件 | 权重 | 通过标准 | 验证方法 |
|------|------|----------|----------|
| **1. 读取 Skill** | 40% | 子 agent 明确说"读取了 xxx/SKILL.md" | 检查回复中是否有读取声明 |
| **2. 触发正确** | 30% | 正确识别任务类型并调用对应 skill | 看是否调用了正确的 skill |
| **3. 流程遵循** | 20% | 按 skill 描述的步骤执行 | 对比 skill 中的步骤 checklist |
| **4. 输出规范** | 10% | 结果符合 skill 规范 | 检查输出格式是否正确 |

### 评分标准

- **90-100分**：优秀 - 完全按 skill 执行，输出完美
- **70-89分**：良好 - 基本按 skill 执行，有小瑕疵
- **50-69分**：及格 - 触发了 skill 但执行有偏差
- **<50分**：失败 - 未触发 skill 或严重偏离

### 失败判定

以下情况直接判定失败：
- 子 agent 完全没有提到读取 skill（0分）
- 子 agent 说"无法找到 skill"
- 子 agent 完全按自己的方式执行，无视 skill

## 验证示例

### 验证 atomic-commits

**Step 1: 准备环境**
```bash
git reset --soft HEAD~1  # 恢复上次提交，创建待提交更改
git status --short        # 确认有更改
```

**Step 2: 调用子 agent**
```javascript
Task({
  description: "提交更改",
  subagent_name: "coder",
  prompt: "提交更改"
})
```

**Step 3: 验收清单（逐项打分）**
- [ ] 子 agent 说"我查看了 atomic-commits skill"（40分）
- [ ] 执行 git status 查看状态（10分）
- [ ] 按功能分类文件（10分）
- [ ] 提交信息格式为 "type: description"（10分）
- [ ] 同一功能合并为一个 commit（20分）
- [ ] 描述使用中文祈使语气（10分）

**总分计算：** 通过的项分数相加

**失败示例：**
```
子 agent 回复："我已提交代码，提交信息是 'update code'"
→ 没有提到读取 skill（0分）
→ 提交信息不规范（0分）
→ 总分：0分，失败
```

## 常见错误

| 错误 | 说明 | 解决 |
|------|------|------|
| 未准备验证环境 | 工作区干净，无更改可提交 | 先执行 git reset --soft HEAD~1 |
| 提示词给暗示 | 说"查看 skill" | 只说自然语言任务 |
| 判断标准不清 | 不知道怎样算通过 | 使用验收清单逐项打分 |
| 权重分配不当 | 把次要条件当主要 | 按表格权重评估 |
