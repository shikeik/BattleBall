# 开发工作流程

## 项目结构

```
battle-ball/
├── src/           # TypeScript 源码（唯一开发入口）
├── dist/          # 编译输出（浏览器实际运行）
├── css/           # 样式文件
├── index.html     # 入口 HTML（引用 dist/）
└── tsconfig.json  # TypeScript 配置
```

**原则**：
- ✅ 只在 `src/` 写代码
- ✅ 浏览器只加载 `dist/` 文件
- ❌ 不要直接修改 `dist/`（会被覆盖）

---

## 日常开发流程

### 1. 修改代码
```bash
# 编辑 src/ 下的 .ts 文件
vim src/toolbar.ts
```

### 2. 编译检查
```bash
# 编译 TypeScript → dist/
npm run build

# 如果报错，修复后继续
# 没有报错表示编译成功
```

### 3. 浏览器验证
```bash
# 刷新浏览器查看效果
# 确保看到的是最新 dist/ 代码
```

### 4. 提交代码
```bash
git add src/ dist/ css/ index.html
git commit -m "feat: xxx"
```

---

## 常用命令

| 命令 | 作用 |
|------|------|
| `npm run build` | 编译 src/ → dist/ |
| `npm run check` | 只检查类型，不生成文件 |
| `git status` | 查看修改状态 |

---

## 从 JS 迁移到 TS（一次性操作）

### Step 1: 创建分支
```bash
git checkout -b refactor/pure-typescript
```

### Step 2: 批量重命名
```bash
cd src
find . -name "*.js" | while read f; do mv "$f" "${f%.js}.ts"; done
cd ..
```

### Step 3: 更新 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": false,
    "noImplicitAny": false,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### Step 4: 更新 index.html
将 `src/xxx.js` 改为 `dist/xxx.js`：
```html
<!-- 改之前 -->
<script src="src/loading-screen.js"></script>

<!-- 改之后 -->
<script src="dist/loading-screen.js"></script>
```

### Step 5: 首次编译
```bash
npm run build
```

### Step 6: 浏览器验证
打开 `index.html`，确认游戏能正常运行。

---

## 常见问题

### Q: 编译报错太多怎么办？
A: 先使用宽松模式（`strict: false`），逐步修复类型错误。

### Q: `window.xxx` 报错未定义？
A: 在 `src/types.d.ts` 添加全局声明：
```typescript
declare global {
  interface Window {
    logger: any;
    toolbar: any;
  }
}
export {};
```

### Q: 为什么浏览器不更新？
A: 检查三点：
1. 是否执行了 `npm run build`
2. index.html 引用的是否是 `dist/` 路径
3. 浏览器缓存（加 `?t=时间戳` 或强制刷新）

---

## 提交规范

```
feat: 新功能
fix: 修复 bug
refactor: 重构（不新增功能）
chore: 构建/工具变更
docs: 文档更新
```

---

*最后更新: 2026-03-27*
