# AGENTS.md

## 项目规范

### 缩进规范

1. **使用 Tab 缩进**：禁止使用空格缩进
2. **统一缩进层级**：1个 Tab = 1个缩进层级

### 日志输出规范

1. **手机环境限制**：手机看不到 `console.log` 输出
2. **统一使用 logger**：全部日志使用 `logger.log(tag, message, data)` 输出
3. **调用前检查**：使用 `if (window.logger)` 确保 logger 已初始化

### 示例
```javascript
// ✅ 正确 - Tab 缩进
if (window.logger) logger.log('TMP', 'debug message', {key: value});

// ❌ 错误 - 空格缩进
if (window.logger) logger.log('TMP', 'debug message', {key: value});

// ❌ 错误 - 手机看不到
console.log('[TMP]', 'debug message');
```
