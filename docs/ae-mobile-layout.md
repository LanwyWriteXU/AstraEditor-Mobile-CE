# AstraEditor Mobile — 横屏编辑器布局设计

> 目标：把 Scratch GUI 改造成面向移动设备的横屏编辑器（参考编程猫 Kitten）。
> 编辑器界面只保留「左侧编辑区 + 右侧工具栏」，舞台 / 造型 / 声音 / 更多 全部独立成页。

## 1. 布局总览

```mermaid
flowchart LR
    subgraph workspace["编辑区（占满剩余宽度）"]
        direction TB
        W["积木工作区 / 造型 / 声音"]
        E["添加扩展按钮（左下角）"]
        W --- E
    end

    subgraph toolbar["右侧工具栏（64px，竖排）"]
        direction TB
        T1["更多"]
        T2["角色"]
        T3["新建角色"]
        T4["切换：积木 / 造型 / 声音"]
        T5["舞台全屏"]
        T6["停止"]
        T7["暂停"]
        T8["开始"]
        T1 --- T2 --- T3 --- T4
        T4 -. 中间留空 .-> T5
        T5 --- T6 --- T7 --- T8
    end

    workspace --- toolbar
```

- 工具栏固定宽 64px，贴在右侧，竖排。
- 顶部组（自上而下）：更多 → 角色 → 新建角色 → 积木/造型/声音切换。
- 中间留空，不摆放任何控件。
- 底部组：舞台全屏 → 停止 → 暂停 → 开始。
- 强制横屏：竖屏时盖一层「请旋转设备」提示，并尝试 `screen.orientation.lock('landscape')`。

## 2. 右侧工具栏

| 按钮 | 行为 |
| --- | --- |
| 更多 | 打开「更多」面板（见第 4 节） |
| 角色 | 打开角色属性面板（见第 3 节） |
| 新建角色 | 打开素材库（复用 `openSpriteLibrary`） |
| 切换 | 弹出悬浮层，三项：积木 / 造型 / 声音，当前项高亮 |
| 舞台全屏 | 切到 Scratch 原生全屏状态：编辑器整体隐藏，舞台铺满视口，工具栏悬浮其上，四键位置不变 |
| 停止 | `vm.stopAll()` |
| 暂停 | `vm.togglePause()`，暂停中图标变「播放」并高亮 |
| 开始 | `vm.start()` + `vm.greenFlag()` |

## 3. 角色属性面板

点「角色」从右侧滑出，覆盖工作区：

1. 角色网格：一排 4 个（`$sprites-per-row`），向下排列，缩略图 + 名字。
2. 属性区（网格下方）：
   - X 坐标 / Y 坐标
   - 大小 / 方向
   - 显示开关 / 旋转方式（自由旋转、左右翻转、不旋转）
3. 面板底部单独一块「背景」：分隔线 + 不同底色，与角色明确区分，显示当前背景缩略图，点击可进背景管理。
4. 点缩略图 = 切换当前角色并收起面板。
5. 长按 / 右键缩略图 = 原版菜单（复制 / 导出 / 删除）；造型、声音入口在右侧工具栏的切换按钮。

## 4. 更多面板

侧滑面板，顶部固定：

- 项目名称（点击可改名，复用 `ProjectTitleInput` 或直接展示）
- 积木总数（复用 `block-count` 插件的算法：各角色 `_blocks` 中非 shadow 块求和）

下面四条，进入二级页：

| 条目 | 二级页内容 |
| --- | --- |
| 文件 | 复用 `MenuBar`（文件/编辑/工具 下拉），保证保存、导出等行为与桌面完全一致 |
| 视口 | 语言、显示模式（界面主题）、积木主题、主题色 —— 直接复用 `LanguageMenu`、`TWGuiThemeMenu`、`TWBlocksThemeMenu`、`TWAccentThemeMenu` |
| 插件 | 调用 `onClickAddonSettings`（TurboWarp Addons 列表） |
| 设置 | 调用 `onClickSettingsModal`（高级设置） |

已移除的入口：README、Monaco 编辑器、教程。

## 5. 编辑区

- 积木页：`<Blocks>` 常驻，不再有 Tab 栏。
- 左下角保留 Scratch 原样「添加扩展」按钮（`$looks-secondary` 竖条）。
- 造型页 / 声音页：复用 `CostumeTab`、`SoundTab`，外面套一层带返回按钮的页面容器。
- 舞台页：复用 `StageWrapper`（full 档）。

## 6. 状态

| 状态 | 来源 |
| --- | --- |
| 当前编辑页（积木/造型/声音） | 复用 `reducers/editor-tab` 的 `activeTabIndex` |
| 舞台全屏 | gui 内局部 state |
| 角色面板开关 | gui 内局部 state |
| 更多面板开关 / 二级页 | gui 内局部 state |
| 暂停状态 | `vm.runtime.paused`（VM 层新增） |

## 7. 代码改动清单

新增 `packages/scratch-gui/src/components/ae-mobile/`：

- `icons.jsx` — 内联 SVG 图标
- `mobile-toolbar.jsx` / `.css` — 右栏 + 切换悬浮层
- `mobile-sprite-panel.jsx` / `.css` — 角色属性面板
- `mobile-more-panel.jsx` / `.css` — 更多面板与二级页
- `mobile-screen.jsx` / `.css` — 全屏页面容器（带返回条）

新增 `packages/scratch-gui/src/lib/project-stats.js` — 积木计数。

修改：

- `components/gui/gui.jsx` — 去掉双栏 + Tab 布局，改为横屏结构
- `components/gui/gui.css` — 工作区样式、竖屏提示层
- `css/units.css` — `$ae-toolbar-width`、`$ae-screen-header-height`
- `playground/index.ejs` — viewport meta（禁缩放、适配刘海屏）
- `packages/scratch-vm/src/engine/runtime.js` — `paused` 标志、`setPaused` / `togglePause`
- `packages/scratch-vm/src/virtual-machine.js` — `pause` / `resume` / `togglePause` / `isPaused`

## 8. 待真机验证

- 触屏上 `MenuLabel` 的下拉是否可点开（文件二级页依赖它）
- 软键盘弹出时工作区是否被遮挡
- 长按 500ms 与积木拖拽是否冲突
- 横屏锁定在各浏览器（Safari / Chrome Android / WebView）的实际表现

## 9. 实现状态

已完成：

- VM 层暂停：`runtime.paused` + `setPaused/togglePause` + `_step` 提前返回，`greenFlag/stopAll` 自动解除暂停；
  `virtual-machine.js` 暴露 `pause/resume/togglePause/isPaused`
- `components/ae-mobile/`：`icons.jsx`、`mobile-toolbar.jsx/.css`、`mobile-sprite-panel.jsx/.css`、
  `mobile-more-panel.jsx/.css`、`mobile-screen.jsx/.css`
- `lib/project-stats.js`：沿用 block-count 插件算法统计非影子块
- `gui.jsx` 重写布局：横屏「编辑区 + 右栏」，舞台/造型/声音独立页，角色面板，更多面板，竖屏提示层
- 编辑区在切到造型/声音页时**只隐藏不卸载**（`.is-hidden`），避免 Blockly 工作区反复重建
- `playground/index.ejs`：viewport 禁缩放 + `viewport-fit=cover`
- `css/units.css`：`$ae-toolbar-width: 64px`、`$ae-screen-header-height`

## 10. 构建 / 检查记录（2026-11-15）

仓库级 `pnpm build` 在当前依赖版本下**跑不通**，与本次改动无关，原因有两个：

1. `scratch-render` / `scratch-vm` 的 build 脚本仍带 `--colors`，webpack-cli 6 已移除该参数 →
   `Error: Unknown option '--colors'`。绕过方式：进包目录直接 `NODE_ENV=production npx webpack`。
2. `scratch-gui` 依赖 `src/generated/microbit-hex-url.cjs`，该文件被 `.gitignore` 忽略，
   需先执行 `node packages/scratch-gui/scripts/prepublish.mjs`（或根目录 `pnpm fetch`）生成。
   这就是「文件缺失」的报错来源。

实际验证结果：

- `eslint --ext .js,.jsx` 覆盖全部改动文件：**0 error**；剩余 warning 为 `canShowReadme`、`intl`、
  `customStageSize`、`TWWindChimeSubmitter` 等已不再使用的旧变量（不影响运行）
- `scratch-render` / `scratch-vm` 库构建成功（vm 的 playground bundle 因 `@turbowarp/scratch-svg-renderer/dist/web`
  缺失而报错，属既有环境问题，不影响库产物）
- `scratch-gui` `NODE_ENV=production npx webpack --bail`：**exit 0**，仅剩 bundle 体积警告

## 11. 已知待打磨

- 「文件」二级页现在是直接复用 `MenuBar`，在 360px 面板内会挤成一横排，且下拉菜单会被面板裁切。
  需要把文件菜单拆成纵向列表（或给 MenuBar 加一个纵向模式）。
- 项目名称目前只做展示，改名仍需桌面式输入控件
- 删除角色未接撤销（`restore-deletion`），且删到只剩一个角色时会静默失败
- 长按菜单出现在手指正下方，靠边时可能超出屏幕

## 12. 第二轮重写（引用原版实现）

针对「汉化缺失 / 角色面板不像 Scratch / 工具栏没迁移 / 全屏舞台不是真全屏」四个问题，
这一轮把自造的部分尽量换成 Scratch 原版组件和文案。

### 12.1 汉化

新增 `src/lib/ae-translations.js`，在 `reducers/locales.js` 里和 TurboWarp 的附加翻译一起
合并进 `editorMessages`（`addAeTranslations`）。只放 Scratch 词库里没有的词：

| id | 中文 |
| --- | --- |
| `ae.mobile.more` | 更多 |
| `ae.mobile.viewport` | 视口 |
| `ae.mobile.pause` / `ae.mobile.resume` | 暂停 / 继续 |
| `ae.mobile.blockCount` | {num} 块积木 |
| `ae.mobile.close` | 关闭 |

其余全部换成原版 id，直接吃 `@turbowarp/scratch-l10n` 自带的中文：

- 运行 `gui.controls.go`、停止 `gui.controls.stop`
- 全屏舞台 `gui.stageHeader.stageSizeFull`（进入全屏模式）
- 角色 `gui.SpriteInfo.sprite`、新建 `gui.spriteSelector.addSpriteFromLibrary`
- 代码/造型/声音 `gui.gui.codeTab` / `gui.gui.costumesTab` / `gui.gui.soundsTab`
- 文件 `gui.menuBar.file`、插件 `tw.menuBar.addons`、设置 `gui.menuBar.settings`

### 12.2 角色面板

不再自己画属性控件，改为直接挂 `containers/target-pane.jsx`（`TargetPane`），
里面就是原版 `SpriteInfo` + `SpriteList` + `ActionMenu` + `StageSelector`。

只调整堆叠顺序与尺寸：

- `components/sprite-selector/sprite-selector.jsx`：`SpriteList` 移到 `SpriteInfo` 之前
- `components/sprite-selector/sprite-selector.css`：改为 flex column，列表 `flex:1` 滚动，
  底部留 `3.25rem` 给原版「添加角色」浮动按钮
- `components/target-pane/target-pane.css`：改为纵向，背景选择器压到底部并旋转成横条
  （用 `[class*='stage-selector_*']` 属性选择器覆盖，不复制原版样式）
- `css/units.css`：`$sprites-per-row` 5 → 4（一排 4 个）
- `components/target-pane/target-pane.jsx`：加 `hideSpriteLibrary`，避免面板内再渲染一份素材库

原版 `SpriteSelectorItem` 自带右键菜单（复制 / 导出 / 删除），长按触发的就是它；
造型 / 声音入口走右侧工具栏的切换按钮。

### 12.3 工具栏

图标全部换成原版资源：`action-menu/icon--sprite.svg`、`gui/icon--code|costumes|sounds.svg`、
`stage-header/icon--fullscreen.svg`、`stop-all/icon--stop-all.svg`、`green-flag/icon--green-flag.svg`。
只有「更多」「新建」「暂停」三个图标仍是内联 SVG（Scratch 没有对应资源）。
宽度 64px，按钮 36px，矮屏仍有余量。

### 12.4 全屏舞台

不再用局部 state，而是走 Scratch 自己的全屏状态：

- 工具栏按钮 → `dispatch(setFullScreen(!isFullScreen))`（`reducers/mode`）
- `gui.jsx` 在 `isFullScreen` 时只渲染 `<StageWrapper hideStageHeader isFullScreen stageSize="full" />`，
  整个编辑器（工作区 / 角色面板 / 更多面板）都不渲染
- `StageWrapper` 新增 `hideStageHeader`，全屏时不渲染桌面舞台头（大小切换 + 绿旗/停止）
- `gui.css` 的 `.mobile-full-stage` 把 `.stage-wrapper.full-screen` 强制拉成 `inset: 0`，
  去掉桌面端为菜单栏预留的顶部偏移
- 工具栏加 `.is-overlay`：全屏时 `position: fixed` 悬浮在舞台之上，四个运行键位置不变

### 12.5 更多面板

「文件」页仍是原版 `MenuBar`，但用 `gui.css` 里的属性选择器把它改造成纵向手风琴：
`.file-page-menu-bar [class*='menu-bar_menu-bar-menu']` 改成 `position: static` 内联展开，
菜单项整行 44px，并隐藏账户 / 分享 / 反馈块。

### 12.6 验证

- `eslint`：0 error（gui.jsx 仍剩若干"未使用 props"的 warning，用于阻止 props 泄漏到 DOM）
- `scratch-gui` 生产构建：`NODE_ENV=production npx webpack --bail` → exit 0，仅体积警告

### 12.7 舞台必须常驻

`vm.attachRenderer()` 是在 `containers/stage.jsx` 挂载时执行的，所以只要页面上没有 `<Stage>`，`vm.renderer` 就是
`undefined`。最初把编辑页的舞台整个移除后，`VMManager.loadProject` 里那行
`vm.renderer.setUseHighQualityRender(...)` 直接抛 `TypeError`。

现在的做法：编辑页也渲染一个 `<StageWrapper>`，放进 `.stage-host` 容器里，用
`position: absolute; left: -3000px` 挪到屏幕外。这样 renderer 始终存在，用户看不到它；
进入全屏时 `StageWrapper` 自己变成 `position: fixed` 覆盖视口，容器位置不再起作用。

## 13. 工具栏与面板的交互修正

| 需求 | 实现 |
| --- | --- |
| 按钮全部正方形 | 工具栏宽 48px，按钮统一 36×36、圆角 8px；`overflow: visible`（不能让弹层被裁） |
| 更多按钮点开变叉 | `isMoreOpen` 切换 `MoreIcon` / `CloseIcon`，并给按钮加选中态 |
| 去掉面板顶部关闭按钮 | `MobileScreen` 不再有 header；角色面板、更多面板的头部按钮全部移除 |
| 点角色按钮展开角色 | 面板改为纯内容 + 底部背景行，靠工具栏按钮或点编辑区（`.panel-scrim`）关闭 |
| 添加角色为悬浮面板 | 新增 `add-sprite-menu.jsx`：复用原版 `ActionMenu`，四项为上传 / 随机 / 绘制 / 素材库；容器仍带 `sprite-selector_add-button` 类名，插件可继续定位 |
| 切换按钮展开浮层 | 原来 `.toolbar { overflow-y: auto }` 把绝对定位的浮层裁掉了，改为 `visible` |
| 暂停按钮对齐插件 | 直接用 `addons/addons/pause/pause.svg` 与 `play.svg` |
| 底部按钮超出屏幕 | 按钮 36px、间距 4px，整列约 332px，`spacer` 撑开中间 |
| 图标变紫 | 代码 / 造型 / 声音三个图标改走 `!../../lib/tw-recolor/build!` 加载器 + `<RecoloredImg>`，跟随主题色 |
| 删除面板内添加按钮 | `mobile-sprite-panel.css` 隐藏 `sprite-selector_add-button`，并去掉 `sprite-selector` 为它预留的底部内边距 |

## 14. addon 初始化竞态与工具栏浮窗

### 14.1 `Cannot access 'guiReducer' before initialization`

`lib/app-state-hoc.jsx` 原来在 `constructor` 里 `require('../reducers/gui')`，注释说明是为了不加载不需要的代码。
但 addon bundle（`addons/entry.js` → `import('./api')`）和 GUI 是两套入口，谁先执行不确定。手机上 addon
chunk 先跑完时，`reducers/gui` 还没有执行完，`require` 拿到的模块读 `default` 直接命中 TDZ，整个页面白屏。

改成在模块顶层加载一次（webpack 会把它当静态依赖，保证求值顺序），`constructor` 只读结果。
同时 `addons/redux.js` 的 `get state` 在 store 尚未创建时返回一个最小默认状态（浏览器语言 + 编辑器模式），
`dispatch` 在 store 为空时直接丢弃，避免 addon 抢先执行时再抛 `Cannot read properties of null`。

### 14.2 工具栏浮窗

- **新建角色**：不再用 `ActionMenu`（它的展开列表是用 `max-height` 动画做的，在 48px 宽的工具列里会被裁成一截）。
  改为自己的一排横向按钮：上传 / 随机 / 绘制 / 素材库，浮在按钮左侧；容器仍带 `sprite-selector_add-button` 类名。
- **切换编辑器**：同样改为横向浮窗，只列出**当前不在**的界面，图标在上、文字 `writing-mode: vertical-rl` 竖排。
- **图标颜色**：代码 / 造型 / 声音恢复用原版 `icon--code|costumes|sounds.svg`，通过 CSS `mask-image` +
  `background-color: currentColor` 上色，形状不变、颜色跟随主题，不再用 recolor 加载器（它会把图标染成主题强调色）。
- 开始 / 停止按钮补上 `green-flag`、`stop-all` 类名，让依赖这些选择器插入内容的插件仍能找到挂载点。

## 15. 局域网访问白屏：crypto.randomUUID

手机通过 `http://192.168.x.x:1145` 打开时：

```
TypeError: crypto.randomUUID is not a function
```

`scratch-vm/src/engine/runtime.js` 有三处 `crypto.randomUUID()`（初始化 `_projectid`）。这个方法只在
**安全上下文**（https / localhost）里存在，局域网 http 访问时 `crypto` 存在但没有 `randomUUID`，
构造 Runtime 直接抛错，整个界面挂掉。

改成使用文件里已经引入的 `uuid` 包（`uuid.v4()`），它内部走 `crypto.getRandomValues`，不受安全上下文限制。
注意 `scratch-gui` 引用的是 `scratch-vm/dist`，所以改完必须先构建 vm。

## 16. 工具栏与面板（本轮）

- **新建角色按钮跑位**：容器为了插件兼容保留了 `sprite-selector_add-button` 类名，但原版那条规则是
  `position: absolute` + `[dir='ltr'] { right: 1rem }`，把它顶出了工具栏。用 `!important` 清掉四个方向的偏移。
- **代码编辑器**：`MONACO_EDITOR_TAB_INDEX` 本来就在 `reducers/editor-tab` 里，`containers/monaco-editor.jsx`
  也一直在，只是没有入口。现在它是切换浮窗的第四项（`ae.mobile.codeEditor`），走 `onActivateTab(3)`。
- **更多面板分组**：条目改为「文件 / 编辑器设置 / 项目设置 / 插件」。文件页渲染 `MenuBar`，用 CSS 只保留
  `data-menu="file|edit|tools"` 三组、隐藏 logo / 账户 / 分享 / 反馈 / 设置菜单，并把下拉面板 (`ul.menu`)
  从 `position: absolute` 改成文档流内联，形成手风琴。
