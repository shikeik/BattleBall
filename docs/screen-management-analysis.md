# SandTank 屏幕管理系统技术精髓分析报告

## 一、架构概览

SandTank 的屏幕管理系统采用**分层架构设计**，核心由三个层次组成：

```
┌─────────────────────────────────────────────────────────────┐
│  应用层 (Application Layer)                                  │
│  - BaseSelectionScreen (选择屏)                              │
│  - 具体游戏屏幕 (GameScreen, MenuScreen等)                    │
├─────────────────────────────────────────────────────────────┤
│  框架层 (Framework Layer)                                    │
│  - ExampleGScreen (示例基类)                                 │
│  - GScreen (屏幕基类)                                        │
├─────────────────────────────────────────────────────────────┤
│  核心层 (Core Layer)                                         │
│  - ScreenManager (屏幕管理器)                                │
│  - SelectionNavigator (导航接口)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、核心技术精髓

### 2.1 屏幕生命周期管理 (GScreen)

#### 精髓 1: 延迟初始化模式 (Lazy Initialization)
```java
// GScreen 中的关键设计
protected boolean initialized = false;

public void initialize() {
    if (initialized) return;  // 幂等性保证
    init();
    initialized = true;
}

private void init() {
    initViewport();           // 子类可覆盖
    resizeWorldCamera(autoCenterWorldCamera);
    stage = new NeonStage(uiViewport);
    batch = new NeonBatch();
    create();                 // 子类实现
}
```

**技术价值**:
- 屏幕实例创建与初始化分离，支持预创建但延迟加载
- 避免在构造函数中做耗时操作
- 支持热重载和状态恢复

#### 精髓 2: 双相机系统 (UI Camera + World Camera)
```java
// UI 相机 - 固定视口，用于界面元素
protected Viewport uiViewport;
protected OrthographicCamera worldCamera = new OrthographicCamera();
protected float worldScale = 1.0f;

// 坐标转换明确分离
public Vector2 screenToUICoord(Vector2 screenCoord);    // UI 坐标转换
public Vector2 screenToWorldCoord(Vector2 screenCoord); // 世界坐标转换
```

**技术价值**:
- UI 与游戏世界渲染完全分离
- 支持视差滚动、缩放不影响 UI
- 清晰的坐标系语义

#### 精髓 3: Dialog 栈管理
```java
protected final Stack<BaseDialog> dialogStack = new Stack<>();

public boolean handleBackKey() {
    // 1. 优先关闭顶层 Modal Dialog
    if (!dialogStack.isEmpty()) {
        BaseDialog top = dialogStack.peek();
        if (top != null && top.hasParent()) {
            top.hide();
            return true; // 消耗 Back 键
        }
    }
    return false; // 交由 ScreenManager 处理
}
```

**技术价值**:
- 模态对话框优先级高于屏幕返回
- 自动处理 Back 键行为链
- 防止对话框泄漏

---

### 2.2 屏幕导航管理 (ScreenManager)

#### 精髓 4: 三种屏幕切换策略

| 方法 | 入栈 | 使用场景 |
|------|------|----------|
| `goScreen()` | ✓ | 正常导航，可返回 |
| `showScreen()` | ✗ | 临时显示（加载界面、弹窗） |
| `replaceScreen()` | 替换 | 完全重置状态 |

```java
// 核心实现：幂等性检查 + 历史栈管理
public ScreenManager goScreen(GScreen screen) {
    if (this.curScreen == screen) return this;  // 幂等性
    
    _initializeScreen(screen);
    
    if (this.curScreen != null) {
        this.curScreen.hide();
        if (!popping) screenHistory.push(curScreen);
    }
    
    this.curScreen = screen;
    this.curScreen.show();
    return this;
}
```

**技术价值**:
- 明确的导航语义，避免栈混乱
- 防止重复进入同一屏幕
- 支持返回栈操作 (`popLastScreen`, `popTo`)

#### 精髓 5: 状态机驱动的转场系统
```java
private enum TransitionState {
    NONE,
    FADE_OUT,      // 透明 -> 黑
    FADE_IN,       // 黑 -> 透明
    LOADING_WAIT,  // 等待加载完成
    OVERLAY_FADE   // 无等待渐变
}

// 四种转场 API
playTransition(Runnable onMiddle);                    // 淡入淡出
playLoadingTransition(loader, tipText, minDuration);  // 带加载动画
playOverlayFade(Runnable action);                     // 无等待渐变
```

**技术价值**:
- 状态机确保转场不会重叠
- 支持异步加载等待
- 无等待渐变不阻塞游戏逻辑

#### 精髓 6: 依赖注入与自动初始化
```java
private void _initializeScreen(GScreen screen) {
    // 自动依赖注入
    if (screen.getScreenManager() == null) {
        screen.setScreenManager(this);
    }
    if (screen.getImp() == null) {
        screen.setImp(new InputMultiplexer());
    }
    // 延迟初始化
    if (!screen.isInitialized()) {
        screen.initialize();
    }
}
```

**技术价值**:
- 屏幕无需关心管理器实例
- 支持反射创建和手动创建
- 输入处理器自动绑定

---

### 2.3 选择屏架构 (BaseSelectionScreen)

#### 精髓 7: 模板方法模式 + 抽象映射
```java
public abstract class BaseSelectionScreen extends ExampleGScreen {
    protected final Map<String, Class<? extends GScreen>> screenMapping = new LinkedHashMap<>();
    
    // 子类只需实现这个方法
    protected abstract void initScreenMapping(Map<String, Class<? extends GScreen>> map);
    
    @Override
    public void create() {
        // 框架层统一实现 UI 创建
        stage = new Stage(getUIViewport());
        rootTable = new VisTable();
        // ... 自动构建按钮列表
    }
}
```

**技术价值**:
- 子类只需声明映射关系，无需处理 UI 细节
- 统一的视觉风格和交互逻辑
- 易于扩展新的选择屏

#### 精髓 8: 导航输入抽象 (SelectionNavigator)
```java
public interface SelectionNavigator {
    boolean isUpJustPressed();
    boolean isDownJustPressed();
    boolean isConfirmJustPressed();
    boolean isKeyboardMode();
}

// 使用时注入
public static void setNavigator(SelectionNavigator nav) {
    navigator = nav;
}
```

**技术价值**:
- 解耦引擎与项目输入实现
- 支持键盘、手柄、触摸等多种输入方式
- 便于单元测试（可注入 Mock）

#### 精髓 9: 焦点管理系统
```java
private void handleFocusInput() {
    if (navigator.isDownJustPressed()) {
        focusedIndex = (focusedIndex + 1) % selectionButtons.size;
    } else if (navigator.isUpJustPressed()) {
        focusedIndex = (focusedIndex - 1 + selectionButtons.size) % selectionButtons.size;
    }
    
    if (navigator.isConfirmJustPressed() && focusedIndex >= 0) {
        // 模拟点击事件
        VisTextButton btn = selectionButtons.get(focusedIndex);
        btn.fire(new InputEvent(InputEvent.Type.touchDown));
        btn.fire(new InputEvent(InputEvent.Type.touchUp));
    }
}
```

**技术价值**:
- 统一的键盘/手柄导航支持
- 视觉反馈与逻辑分离
- 循环焦点（到达末尾回到开头）

---

## 三、设计模式总结

| 模式 | 应用位置 | 目的 |
|------|----------|------|
| **单例模式** | ScreenManager | 全局唯一的屏幕管理入口 |
| **状态模式** | TransitionState | 转场状态管理 |
| **模板方法** | BaseSelectionScreen | 固定算法骨架，变化点延迟到子类 |
| **策略模式** | SelectionNavigator | 输入方式可替换 |
| **依赖注入** | _initializeScreen | 解耦组件依赖 |
| **观察者模式** | exitGame 回调列表 | 多监听器事件通知 |

---

## 四、迁移建议

### 4.1 JavaScript 版本架构设计

```javascript
// 核心类对应关系
GScreen          -> Scene
ScreenManager    -> SceneManager  
BaseSelectionScreen -> MenuScene
SelectionNavigator  -> InputNavigator (interface)
```

### 4.2 关键迁移点

1. **生命周期映射**
   ```javascript
   // Java (GScreen) -> JavaScript (Scene)
   create()     -> init()      // 初始化
   show()       -> enter()     // 进入
   hide()       -> exit()      // 离开
   render0()    -> render()    // 库层只提供 render
   dispose()    -> destroy()   // 销毁
   
   // 注意：库层不强制 update/render 分离
   // 业务层自行决定是否在 render 内部分离逻辑和渲染
   ```

2. **导航栈实现**
   ```javascript
   class SceneManager {
       constructor() {
           this.sceneStack = [];      // 历史栈
           this.currentScene = null;
           this.scenes = new Map();    // 注册表
       }
       
       goScene(sceneClass) { /* 入栈导航 */ }
       showScene(sceneClass) { /* 不入栈显示 */ }
       replaceScene(sceneClass) { /* 替换 */ }
       popScene() { /* 返回 */ }
   }
   ```

3. **转场状态机**
   ```javascript
   const TransitionState = {
       NONE: 0,
       FADE_OUT: 1,
       FADE_IN: 2,
       LOADING_WAIT: 3,
       OVERLAY_FADE: 4
   };
   ```

4. **选择屏模板**
   ```javascript
   class MenuScene extends Scene {
       initScreenMapping(map) {
           // 子类实现
           map.set('开始游戏', GameScene);
           map.set('设置', SettingsScene);
       }
       
       create() {
           // 框架自动生成按钮
           this.buttons = this.createButtonsFromMapping();
       }
   }
   ```

### 4.3 注意事项

1. **输入处理**: Web 环境需要适配键盘、触摸、手柄事件
2. **资源管理**: JavaScript 需要手动管理 Canvas/上下文
3. **异步加载**: 转场的 Loading 状态需要配合资源加载 Promise
4. **内存管理**: 注意场景切换时的资源释放
5. **库层简洁**: 库层只提供 render 入口，不强制逻辑/渲染分离

---

## 五、核心代码参考

### 5.1 最小可用 Scene 基类

```javascript
class Scene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.initialized = false;
        this.visible = false;
    }
    
    initialize() {
        if (this.initialized) return;
        this.init();
        this.initialized = true;
    }
    
    init() {
        // 子类覆盖：初始化资源
    }
    
    enter() {
        this.visible = true;
    }
    
    exit() {
        this.visible = false;
    }
    
    /**
     * 库层只提供 render 方法。
     * 业务层若需要逻辑/渲染分离，自行在内部实现 update/render 分离。
     */
    render(delta) {
        // 子类实现：统一处理逻辑+渲染，或仅渲染
    }
    
    handleBack() {
        return false; // 未处理
    }
    
    destroy() {
        // 子类覆盖：释放资源
    }
}
```

### 5.2 最小可用 SceneManager

```javascript
class SceneManager {
    constructor() {
        this.scenes = new Map();
        this.stack = [];
        this.current = null;
        this.transitionState = 'NONE';
    }
    
    register(sceneClass, instance) {
        this.scenes.set(sceneClass, instance);
        instance.sceneManager = this;
    }
    
    goScene(sceneClass) {
        if (this.current === this.scenes.get(sceneClass)) return;
        
        const next = this._getOrCreate(sceneClass);
        
        if (this.current) {
            this.current.exit();
            this.stack.push(this.current);
        }
        
        this.current = next;
        this.current.initialize();
        this.current.enter();
    }
    
    popScene() {
        if (this.stack.length === 0) return false;
        
        const prev = this.stack.pop();
        if (this.current) this.current.exit();
        
        this.current = prev;
        this.current.enter();
        return true;
    }
    
    /**
     * 库层只调度 render，不强制分离 update/render
     */
    render(delta) {
        if (this.current) this.current.render(delta);
    }
}
```

---

## 六、总结

SandTank 的屏幕管理系统的核心设计哲学：

1. **单一职责**: GScreen 负责单屏逻辑，ScreenManager 负责导航
2. **开闭原则**: 通过模板方法和接口抽象，扩展无需修改框架
3. **延迟初始化**: 分离创建与初始化，支持复杂依赖管理
4. **状态机驱动**: 转场、返回键处理都采用状态机保证正确性
5. **依赖注入**: 自动注入管理器和输入处理器，降低耦合

这套架构经过实际项目验证，适合迁移到任何游戏框架中。
