# AstraEditor Mobile — 移动端适配重构清单

> 状态：**待执行清单，代码尚未改动。**  
> 目标机型：以手机横屏为主（广视口 568×320 ~ 932×430），不追求桌面浏览器适配——本项目本身就是手机界面。  
> 优先级：P0 = 直接影响可用性/点不到；P1 = 明显拥挤但能用；P2 = 打磨。

---

## 0. 前置约定（所有条目共用）

- [ ] **设计令牌**：新增一组紧凑档变量，避免每个组件各写一遍数字。
  | 令牌      | 桌面现值           | 移动档         | 位置                   |
  | ------- | -------------- | ----------- | -------------------- |
  | 工具列宽    | 44px           | 44px（保留）    | `mobile-toolbar.css` |
  | 按钮边长    | 32px           | **40px**    | 新增 `--ae-control`    |
  | 触摸最小目标  | —              | **40×40px** | 新增 `--ae-touch`      |
  | 基础间距    | 8px (`$space`) | **6px**     | 新增 `--ae-gap`        |
  | 正文/标签字号 | 10–14px        | **12px 起**  | 新增 `--ae-font`       |
  | 行高（列表项） | 44px           | 44px（保留）    | 已有                   |
- [ ] **断点策略**：用「高度优先」判定紧凑档 —— `@media (max-height: 420px)` 覆盖手机横屏（320/360/375 高都命中，iPad 横屏 768 不命中）。宽度断点只在素材库网格用（`min-width` 卡片数）。
- [ ] **根高度锚定**（P0）：`html, body, #app { height: 100% }`，`.page-wrapper` 改 `height: 100dvh`。现在 `gui.css:5` 只有 `height: 100%`，而仓库里没有任何祖先给 `html/body/#app` 设高度（`normalize.css` 只设字体），百分比高度会退化成内容高度，编辑区高度实际由工具栏按钮列的固有高度决定。
- [ ] **安全区**：全屏层、工具栏、抽屉底部统一补 `env(safe-area-inset-*)`（现在只有 viewport meta 声明了 `viewport-fit=cover`，样式里一处都没用）。
- [ ] **触摸基础样式**：`-webkit-tap-highlight-color: transparent`、可点击元素 `touch-action: manipulation`、列表/缩略图 `user-select: none`（目前只在工具栏上有）。
- [ ] **`:hover` 兜底**：所有依赖 hover 才出现的东西（Monaco 文件操作、paint/缩略图的工具按钮等）补 `@media (hover: none)` 常显分支。

---

## 1. P0 — 先救命（点不到 / 看不到）

- [ ] **Monaco 文件操作按钮常显**：`monaco-editor.css` 里 `.file-actions { opacity: 0 }` + `.file-item:hover .file-actions { opacity: 1 }`，触屏没有 hover，重命名/删除入口等于不存在。改为 `@media (hover: none) { .file-actions { opacity: 1 } }` 并放大到 40px。
- [ ] **编辑页可滚动兜底**：`mobile-screen.css` 的 `.screen` 没有 `overflow`，造型/声音页超出的内容直接被裁掉、连滚动都做不到。先加 `overflow-y: auto; -webkit-overflow-scrolling: touch`（结构重排后再逐步收回，见 3、4 节）。
- [ ] **模态框高度**：`modal.css` 的 `.modal-content { margin: 100px auto }` 无 `max-height`/`overflow`，320 高屏幕顶部边距吃掉 1/3。改为 `margin: 8px auto`、`max-height: calc(100dvh - 2*env(safe-area-inset-bottom) - 16px)`、`overflow-y: auto`（完整方案见第 2 节）。
- [ ] **`100vh` → `100dvh`**：`library.css:22`、`tw-settings-modal`、`fonts-modal`、`restore-point-modal`、`invalid-project-modal`、`unknown-platform-modal`、`ae-readme`、`ae-custom-theme`、`ae-preview-ext`、`extension-chooser`、`stage-wrapper` 共 10+ 处。
- [ ] **积木区点击热区**：`.extension-button-container` 60×52 固定压在左下角，在 320 高屏幕占 16%；compact 档降到 44×40。工具箱宽度 **不改**（已有折叠工具箱插件，等插件 UI 修复后自行接管）。
- [ ] **删除失效的 `$ae-toolbar-width: 64px`**（`units.css:44`，没有任何地方引用），文档里写的「工具栏 64px / 按钮 36px」与代码实际的 44/32 已经脱节，一并订正。

---

## 2. 模态框 → 底部抽屉

### 2.1 统一容器

|   |   |   |
| - | - | - |

- [ ] 给 `containers/modal.jsx` + `components/modal` 增加 `variant` 参数：`'sheet' | 'fullscreen' | 'dialog'`，默认在紧凑档解析为 `sheet`。
- [ ] sheet 样式：顶部圆角 16px、顶部 4px×40px 抓手条、`transform: translateY(100%) → 0` 的滑入动画（200ms）、`max-height: 90dvh`、内部 `overflow-y: auto`、`overscroll-behavior: contain`（防止拖动把外层滚动带走）。
- [ ] 遮罩层：点击关闭、`padding-bottom: env(safe-area-inset-bottom)`；保留现有 `popstate` 返回键关闭逻辑（`containers/modal.jsx` 已实现）。
- [ ] `.header` 的三段式修好：`$sides: 20rem`（320px）在两翼对称占位，640 宽时标题区被挤成 0。紧凑档把两翼降到 44px，标题 `text-overflow: ellipsis`、`white-space: nowrap`。

### 2.2 按类型分流（逐个确认）

| 弹窗                                            | 现状                                        | 目标形态                                                 |
| --------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| 素材库（造型/背景/角色/声音，`library.jsx` 已 `fullScreen`） | 全屏，filter 栏固定 11.5rem 输入框 + 一排标签          | 全屏 sheet，filter 栏改「搜索图标 + 展开输入」或标签横滑                 |
| 项目设置 / 编辑器设置（`tw-settings-modal`，更多面板内联）      | 桌面双 tab + `max-height: calc(100vh-250px)` | 面板内保持内联，但高度改 `100%` 交给面板滚动；独立打开时走 sheet              |
| 提示输入（`prompt`、`slider-prompt`）                | 固定 `width: 360px`                         | 底部 sheet，宽度 `100%`，输入框 `font-size: 16px`（防 iOS 自动放大） |
| 恢复点 / 字体 / 自定义扩展 / 安全管理 / README              | `max-height: calc(100vh - 150~250px)`     | sheet，`max-height: 90dvh`                            |
| 连接设备（`connection-modal`）/ 录音（`record-modal`）  | 居中卡片                                      | sheet（`connection-modal` 保留居中，但加滚动）                  |
| 遥测 / 浏览器不支持 / 未知平台 / 无效项目                     | 阻塞型                                       | 居中窄卡片，宽度 `min(360px, 92vw)`，内容可滚                     |
| `file-selection-modal`（Monaco 生成积木）           | 固定 `320px !important`                     | 删除硬编码，走 sheet                                        |

### 2.3 素材库内部

- [ ] 网格卡片在紧凑档缩到 `minmax(96px, 1fr)`，一屏 4 列（现在按 120px 卡片在 640 宽只能放 3 列、且标签栏占掉 64px）。
- [ ] filter 栏高度 `calc($library-filter-bar-height + 2rem)` = 72px → 48px。

---

## 3. 造型编辑器

### 3.1 左侧缩略图列（保留 + 可折叠）

- [ ] 保留左侧列（`asset-panel/selector.css` 在 ≤1256px 时 80px 宽），新增**折叠态**：44px 竖条，只显示当前造型缩略图 + 展开按钮。
- [ ] 折叠/展开状态记在 localStorage（`ae:costumeSelectorCollapsed`），默认**展开**（首次使用要能看见"添加造型"）。
- [ ] 折叠态下原有的 5 个按钮（素材库 / 上传 / 随机 / 绘制 / 搜索）收成底部一枚「+」——复用 `ae-mobile/add-sprite-menu.jsx` 的横向浮层模式，保证添加造型逻辑不跑偏。
- [ ] 展开/折叠用宽度过渡（160ms），不要 unmount，避免 paint 画布重排后需要重新计算尺寸。

### 3.2 顶部工具栏：两行 → 一行

- [ ] 目前 `paint-editor.jsx` 顶部是「名字 + 撤销/重做」（FixedTools 一行）+「填充/描边/粗细 + 模式工具」（第二行），两行约 91px，在 320 高屏幕占 28%。
- [ ] 合并为一行：`名字输入` `撤销` `重做` `颜色/粗细聚合按钮` `更多(...)`。
- [ ] 描边颜色、笔画预设、模式工具（文本字体等）收进「更多」浮层；浮层是底部 sheet 或从按钮上方展开的横向面板（两者选一，建议 sheet，触摸更好点）。

### 3.3 笔画粗细：单按钮 + 长按滑杆

- [ ] 一个圆形按钮显示当前笔画颜色（矢量模式再叠一个描边环），点击/长按分流：
  - **点击（<400ms）** → 打开「颜色 + 粗细」sheet：色板、十六进制输入、粗细数字输入（步进 1，范围随模式）、3–5 个常用预设。
  - **长按（≥500ms）** → 在按钮旁浮出一条水平滑杆（拖动实时改粗细），松手 300ms 后自动收起；长按期间禁止画布的绘制手势（`preventDefault` + 置一个 `isAdjusting` 标志，让 canvas 的 pointerdown 直接返回）。
- [ ] 长按需同时处理 `touchstart` 与鼠标（桌面调试），并用 `pointercancel` 兜底收起。
- [ ] 拖动时浮出数值气泡（`stroke-width 3`），避免用户靠眼睛猜。

### 3.4 双指缩放（必须做）

- [ ] 画布容器 `touch-action: none`，手动管理：
  - 单指 → 透传给 paint 现有绘制逻辑（不要拦截 `pointerdown` 的默认行为，只监听并记录）。
  - 双指 → 计算两指中点与距离，映射到现有 `onZoomIn/onZoomOut/zoomLevel`（`paint-editor.jsx` 已有 zoom 状态），按倍数连续缩放；同时按中点做平移。
  - 松手回单指时不要跳变（记录基准 zoom/offset）。
- [ ] 双击画布 = 缩放重置（已有 `onZoomReset`）。
- [ ] 缩放上限/下限沿用现有 zoom 限制，避免缩到看不见。

### 3.5 布局重排

- [ ] 10 个绘制模式（`.mode-selector`，`max-width: 7.5rem` 的 2×5 竖网格）→ **画布下沿横条**，可横向滚动，图标 32px、命中区 44px。
- [ ] 删除 `.top-align-row { min-width: 524px }`、`.canvas-container { min-width: 402px }`，画布改 `flex: 1; min-width: 0`。
- [ ] 底部 `.canvas-controls`（36px：位图/矢量 + 缩放 + 主题）与模式条合并成一条 44px 工具带；位图/矢量切换改成图标。
- [ ] `editor-container` 的 padding 从 `3*$grid-unit`(12px) 降到 6px。

---

## 4. 声音编辑器

- [ ] **高度主权交给波形**：`.waveform-container` 改 `flex: 1 1 auto; min-height: 80px`，上下 margin 20px → 8px。
- [ ] **控制区压到两行**：
  - 第一行：名字输入 + 时长/大小（现在是第三个独立 `row`）+ 播放/停止。
  - 第二行：撤销 / 重做 / 复制 / 粘贴 / 静音 / 修剪 图标条。
- [ ] **13 个效果 → 底部胶囊横滑条**：`overflow-x: auto`、`scroll-snap`、每个胶囊 min-width 64px / 高 44px、字号 12px（现在 `flex-basis: 60px` + `font-size: 0.625rem`，10px 字太小）。
- [ ] **补齐触屏专用按钮**：`containers/sound-editor.jsx` 里 `Delete`、`Shift+Delete`、`Ctrl+Z/C/V/A`、空格全是键盘路径，触屏至少要补「删除选中」「反向删除（保留选中）」，并让它们在无选区时置灰。
- [ ] 修剪手柄（`audio-trimmer/selection-handle.jsx`）的命中区从当前可视宽度扩到 24px（透明扩展，不改变视觉）。

---

## 5. 代码编辑器（Monaco）

- [ ] **侧栏 200px → 抽屉**：默认收起；顶部改成「当前文件」下拉 + 文件数徽标，点开滑出文件列表（覆盖式，不挤压编辑器）。200px 在 596px 屏宽占 34%，是编辑器拥挤的主因。
- [ ] **文件操作常显**：重命名/删除按钮不再靠 hover（见 P0 条目）；文件名过长省略，长按弹出「重命名 / 删除 / 复制」。
- [ ] **Monaco 选项按移动端重设**：
  - `minimap.enabled` 跟随设置（当前 `monaco-editor.jsx:1035` 硬编码 `true`，完全无视设置项，是 bug），移动端默认 `false`。
  - `hover.enabled: false`（触屏没有悬停）、`foldingControls: 'always'`、`glyphMargin: false`。
  - `scrollbar` 从 14px + `arrowSize: 30` 收细到 8px、`arrowSize: 0`。
  - `formatOnType: false`（移动输入法下会和预测输入打架），`quickSuggestions` 只保留 `other`。
  - `fontSize` 默认 14 保留，`lineNumbers` 在宽度 < 520 时关。
- [ ] **顶栏**：`生成积木` 改图标 + 收进溢出菜单；字号 `-/+` 保留（Monaco 不支持双指缩放）。
- [ ] **软键盘**：监听 `window.visualViewport` 的 `resize`/`scroll`，把编辑器容器高度设为 `visualViewport.height`，避免键盘弹出后底部代码区被挡住；收起键盘时恢复。
- [ ] 生成积木的文件选择弹窗走第 2 节 sheet 规范（删掉 `320px !important`）。

---

## 6. 全屏舞台旋转（新增功能）

### 6.1 交互定义

|   |   |
| - | - |

- [ ] 只存在于**全屏舞台**期间的状态：`stageOrientation: 'landscape' | 'portrait'`，默认 `landscape`。
- [ ] 旋转按钮：
  - 横屏模式 → 固定在**右上角**（`position: fixed; top: calc(8px + safe-area-inset-top); right: 8px`）。
  - 竖屏模式 → 固定在**左下角**（`bottom: calc(8px + safe-area-inset-bottom); left: 8px`）。
  - 按钮本身**不参与旋转**，永远正立、永远可点。
- [ ] 竖屏模式下的舞台：`<Stage>` 画布整体旋转 90°（`transform: rotate(90deg)`，宽高互换后铺满可视高度），4:3 舞台变成 3:4 竖构图，正好填满竖屏，不做 letterbox。
- [ ] 控制按钮：横屏维持现有右侧竖列（`.toolbar.is-overlay`）；竖屏时同样**排在右侧**（不跟随旋转），间距与尺寸不变。
- [ ] **退出全屏时强制回横屏**：`setFullScreen(false)` 的路径里重置 `stageOrientation = 'landscape'`，避免编辑界面带着旋转状态。
- [ ] 屏幕方向变化**不自动切换**（避免和系统旋转打架），只由按钮控制；可选优化：`orientationchange` 时在按钮上加一个轻微脉冲提示可点。

### 6.2 实现要点

- [ ] 旋转层与固定层分离：`<div class="stage-rotator">`（负责 transform）+ 工具栏/旋转按钮放在其**外部**（`position: fixed` 的独立层），否则按钮会跟着转 90°。
- [ ] 旋转后要重新触发 renderer 尺寸计算（`vm.renderer.resize()` 或 `StageWrapper` 已有的 resize 监听），否则画面比例会错。
- [ ] 现有 `.rotate-hint`（`gui.css:529` 的竖屏遮罩）只在**非全屏**生效：`{!isFullScreen && <div className={styles.rotateHint} />}`，否则全屏竖屏会被自己的遮罩挡住。
- [ ] 全屏层 `z-index` 关系梳理：舞台 < 旋转层 < 工具栏(is-overlay, 9999) < 按钮层。
- [ ] 按钮图标用内联 SVG（新增 `icon--rotate.svg` 到 `ae-mobile/icons.jsx`），并加无障碍 label（复用 `ae-translations.js` 补一条 `ae.mobile.rotateStage`）。

### 6.3 待确认（实现前定一下）

1. 「竖屏」指**手动按钮切换的舞台构图**（本清单按此实现）。
2. 竖屏模式下，舞台保持完整可见 + 黑边。
3. 旋转切换是否需要过渡动画？随便。

---

## 7. 收尾与验证

- [ ] `eslint --ext .js,.jsx`：0 error（不新增 warning）。
- [ ] `cd packages/scratch-gui && NODE_ENV=production npx webpack --bail`：exit 0。
- [ ] 真机验证清单：
  - [ ] 568×320 / 640×360 / 812×375 / 932×430 四种视口，无横向滚动条
  - [ ] 造型页：画布高度 ≥ 140px、单指画画不断触、双指缩放不误触绘制
  - [ ] 声音页：波形可见、13 个效果可横滑、无选区时删除置灰
  - [ ] 代码页：软键盘弹出后光标不被挡、文件重命名可点
  - [ ] 全屏舞台：横↔竖切换后画面比例正常、退出全屏回横屏
  - [ ] 所有弹窗：能滚到底、能点遮罩关闭、能按返回键关闭
- [ ] 更新 `docs/ae-mobile-layout.md`：工具栏实际尺寸（44/32 → 40）、紧凑档变量表、旋转功能、已移除的 `$ae-toolbar-width`。

---

## 附：改动文件索引（预估）

| 区域    | 文件                                                                                                                                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 令牌/断点 | `src/css/units.css`、`src/components/gui/gui.css`                                                                                                                                                                                                        |
| 模态框   | `src/components/modal/modal.{jsx,css}`、`src/containers/modal.jsx`、`src/components/prompt/*`、`src/components/library/library.css`、`src/components/tw-settings-modal/settings-modal.css` 等 10+ 弹窗                                                         |
| 造型    | `src/containers/costume-tab.jsx`、`src/components/asset-panel/{asset-panel,selector}.{jsx,css}`、`packages/scratch-paint/src/components/paint-editor/*`、`.../fixed-tools/*`、`.../mode-tools/*`、`.../stroke-width-indicator.jsx`、`.../scrollable-canvas/*` |
| 声音    | `src/components/sound-editor/sound-editor.{jsx,css}`、`src/containers/sound-editor.jsx`、`src/components/audio-trimmer/*`                                                                                                                                 |
| 代码    | `src/components/monaco-editor/monaco-editor.{jsx,css}`                                                                                                                                                                                                  |
| 全屏旋转  | `src/components/gui/gui.{jsx,css}`、`src/components/ae-mobile/mobile-toolbar.{jsx,css}`、`src/components/ae-mobile/icons.jsx`、`src/lib/ae-translations.js`                                                                                                |
| 导航/外壳 | `src/components/ae-mobile/*`（toolbar/panels/screen）                                                                                                                                                                                                     |

---

## 进度（2026-11-21 第一轮实现）

已完成并写入代码：

- **0 前置**：`gui.css` 里 `html/body/#app` 高度锚定 + `.page-wrapper` 用 `100dvh`；`mobile-screen` 补兜底滚动；`units.css` 的 `$ae-toolbar-width` 订正为 44px 并新增 `$ae-touch-target`。
- **1 P0**：Monaco 文件操作不再依赖 hover（`@media (hover: none)` 常显）；模态框 `max-height: 100dvh`；全仓 15 处 `100vh` 增加 `100dvh` 回退；扩展按钮在 `max-height: 420px` 收到 44×40。
- **2 模态框**：`@media (max-height: 420px)` 下所有非全屏弹窗自动变成底部抽屉（圆角 + 上滑动画 + 内部滚动），头部 `$sides` 从 20rem 降到 2.75rem 并允许标题省略号；素材库卡片 160→120（一屏 4 列），filter 栏 72→40px，标签横滑。
- **3 造型**：左侧缩略图列可折叠（20px 竖条 + localStorage 记忆，折叠后画布拿回宽度）；顶部两行工具合并成一条可横向滚动的工具带；绘制模式移到画布下方横向条；画布去掉 524/402 最小宽度；笔画粗细改为单按钮（点击开面板 / 长按开面板直接拖滑杆，面板含滑杆 + 数字 + 预设 0/2/4/8/16）；画布双指缩放 + 双指平移（`scrollable-canvas` 里新增 touch 处理）。
- **4 声音**：波形获得 `flex: 1` 与 64px 最小高度；控制行横向可滚；10 个效果改横滑胶囊（56px 最小宽、字号 10→11.2px）；播放键 42px；信息/警告行压缩。
- **5 代码**：侧栏 200px 改为滑出抽屉（默认收起，顶部「☰ 文件名」按钮触发，遮罩点击关闭）；`minimap` 跟随设置（默认关，修掉硬编码 true）；`hover` 关闭、折叠控件常显、滚动条 14→10、`formatOnType` 关闭；「生成积木」紧凑档收成图标；`visualViewport` 处理软键盘。
- **6 全屏旋转**：全屏时出现旋转按钮（横屏右上 / 竖屏左下，固定定位不参与旋转）；竖屏把整个舞台层按 100dvh×100dvw 布局后 `rotate(90deg)`，4:3 内容填满竖屏；控制按钮始终在右侧；退出全屏强制回到横屏；`rotate-hint` 只在非全屏生效；补了 `ae.mobile.rotateStage` 四语言文案。

尚未做（下一轮）：

- 造型编辑器把「色彩选择」并入粗细面板（现在色彩仍是相邻的两枚色块按钮，各自点击已是色彩面板）。合并需要动 paint 的 redux（`colorModalVisible` 是按 fill/stroke 分开管理的）。
- 竖屏编辑界面（按需求不做）。
- 真机验证：320×568 / 360×640 / 375×812 三种尺寸、软键盘、旋转后的拖拽落点。
