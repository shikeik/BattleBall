# 查看截图 Skill

## 触发词

- "看截图最新一张"
- "看截图最新几张"
- "看截图"
- "截图最新一张"

## 行为

当用户说以上触发词时，自动查找最新的截图并读取。

## 使用方法

```bash
# 查找最新的截图文件
ls -t /storage/emulated/0/DCIM/Screenshots/*.jpg | head -1

# 读取截图
ReadMediaFile <path>
```

## 示例

用户说："看截图最新一张"

AI 应该：
1. 找到最新截图路径
2. 使用 ReadMediaFile 读取
3. 分析截图内容

## 代码示例

```javascript
// 获取最新截图路径
const latestScreenshot = Shell({
  command: "ls -t /storage/emulated/0/DCIM/Screenshots/*.jpg | head -1"
});

// 读取截图
ReadMediaFile({ path: latestScreenshot.trim() });
```
