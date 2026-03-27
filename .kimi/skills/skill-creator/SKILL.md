---
name: skill-creator
description: Skill 创建助手。指导如何创建符合规范的 Skill，包括 SKILL.md 编写、VALIDATION.md 验收清单创建、目录结构组织。当用户说"创建 skill"、"新建技能"、"写 skill"、"添加技能"或需要创建新技能时触发。
---

# Skill 创建助手

指导创建符合规范的 Skill。

## 创建流程

### Step 1: 确定技能需求

**是否需要创建 Skill？**

| 场景 | 是否需要 |
|------|----------|
| 偶尔问一次的问题 | ❌ 不需要 |
| 重复 3+ 次的流程 | ✅ 需要 |
| 多人协作的规范 | ✅ 需要 |
| 复杂的领域知识 | ✅ 需要 |

### Step 2: 创建目录结构

```
.kimi/skills/skill-name/
├── SKILL.md           # 必需：技能定义
├── VALIDATION.md      # 必需：验收清单（新增硬性要求）
├── scripts/           # 可选：可执行脚本
├── references/        # 可选：参考文档
└── assets/            # 可选：模板资源
```

**硬性要求：必须同时创建 VALIDATION.md！**

### Step 3: 编写 SKILL.md

**Frontmatter（YAML）：**
```yaml
---
name: skill-name
description: 详细描述 + 触发词："xxx"、"yyy"、"zzz"时触发
---
```

**description 要求：**
- 说明技能做什么
- **必须包含触发词**（用引号括起来）
- 示例："当用户说'提交'、'commit'、'提交代码'时触发"

**Body（Markdown）：**
- 触发条件
- 执行流程（步骤 1、2、3...）
- 关键信息（表格）
- 示例

### Step 4: 编写 VALIDATION.md（必需）

每个技能必须有自己的验收清单：

```markdown
# 验收清单

## 验证环境准备
- [ ] 准备测试环境（如 git reset --soft HEAD~1）
- [ ] 确认有更改可测试

## 自然语言触发测试
| 触发词 | 预期行为 | 通过 |
|--------|----------|------|
| "xxx" | 按 skill 执行 | ☐ |
| "yyy" | 按 skill 执行 | ☐ |

## 功能验收清单
- [ ] 检查项 1
- [ ] 检查项 2
- [ ] 检查项 3

## 评分标准
- 全中：100分（优秀）
- 部分：60-80分（需改进）
- 很少：<60分（失败）
```

### Step 5: 测试验证

1. 保存文件到 `.kimi/skills/skill-name/`
2. 使用 skill-validator 验证
3. 根据 VALIDATION.md 逐项检查
4. 不通过则修改，再验证

## 最佳实践

### 简洁原则
- SKILL.md < 5k 词
- 只写 Kimi 不知道的内容
- 用示例代替解释

### 触发词设计
- 用常见自然语言
- 覆盖多种说法
- 不要太通用（避免误触发）

### VALIDATION.md 必须包含
- 环境准备步骤
- 至少 3 个触发词测试
- 功能验收清单
- 明确的评分标准

## 检查清单

创建完成后检查：
- [ ] 目录名 = skill name
- [ ] SKILL.md 有 name 和 description
- [ ] description 包含触发词
- [ ] **VALIDATION.md 已创建**
- [ ] VALIDATION.md 有验收清单
- [ ] 已测试验证
