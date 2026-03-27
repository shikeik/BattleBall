---
name: view-media
description: 查看手机截图、视频和日志文件。自动查找并读取最新的截图（DCIM/Screenshots）、录屏视频（DCIM/ScreenRecorder）和游戏日志（Download/game-log）。当用户说"看截图"、"看最新视频"、"看录屏"、"看日志"、"看log"或需要查看手机上的媒体文件时触发。
---

# 查看截图/视频/日志

## 文件路径

| 类型 | 路径 |
|------|------|
| 截图 | `/storage/emulated/0/DCIM/Screenshots/*.jpg` |
| 视频/录屏 | `/storage/emulated/0/DCIM/ScreenRecorder/*.mp4` |
| 日志 | `/storage/emulated/0/Download/game-log*.log` |

## 使用方法

### 查看最新截图

```bash
# 查找最新截图
ls -t /storage/emulated/0/DCIM/Screenshots/*.jpg | head -1

# 读取截图
ReadMediaFile <path>
```

### 查看最新视频

```bash
# 查找最新视频
ls -t /storage/emulated/0/DCIM/ScreenRecorder/*.mp4 | head -1

# 读取视频
ReadMediaFile <path>
```

### 查看最新日志

```bash
# 查找最新日志
ls -t /storage/emulated/0/Download/game-log*.log | head -1

# 读取内容
cat <path> | head -100
```

## 常用命令

```javascript
// 获取最新截图
const latestScreenshot = Shell({
  command: "ls -t /storage/emulated/0/DCIM/Screenshots/*.jpg | head -1"
});
ReadMediaFile({ path: latestScreenshot.trim() });

// 获取最新视频
const latestVideo = Shell({
  command: "ls -t /storage/emulated/0/DCIM/ScreenRecorder/*.mp4 | head -1"
});
ReadMediaFile({ path: latestVideo.trim() });

// 获取最新日志
const latestLog = Shell({
  command: "ls -t /storage/emulated/0/Download/game-log*.log | head -1"
});
ReadFile({ path: latestLog.trim(), n_lines: 100 });
```

## 触发关键词

- "看截图最新一张"
- "看截图"
- "看最新视频"
- "看录屏"
- "看最新日志"
- "看log"
