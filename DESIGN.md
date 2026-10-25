# Dino Blog 设计语言

本文记录现有博客的设计依据，并约定 Twikoo 评论区如何融入。**“现有”描述代码事实，“评论区约定”是本次新增组件的维护规则**；组件尺寸不自动成为全站 token。视觉值以 `src/styles/_tokens.scss` 为准，配置入口为 `blog.config.ts`。

## 现有：整体方向与结构

页面以阅读为中心：浅灰或近黑底色、对比温和的纯色表面、宽松留白、清晰字号层级和少量蓝色操作。主内容卡片通常没有阴影，依靠背景层次区分；半透明与模糊主要用于导航及浮层。链接靠颜色和悬停下划线表达交互。

- 页面内容最大宽度 `--page-max: 980px`；文章内容 `--article-max: 800px`；页面边距 `--page-gutter: 16px`。
- `.article-shell` 的外宽允许正文宽度加两侧边距，实际文本保留 16px 内边距。新增区块应检查可见内容的对齐，不能只比较容器的 `max-width`。
- 文章正文、版权、相邻文章等大区块采用 64px 间距；版权卡内边距 16px、卡片标题下间距 16px。8、16、24、32、64px 是常见节奏，当前未定义统一 spacing token。
- 固定导航高度 48px。主要断点为 600px（导航切换）、800px（文章卡片/代码/表格可铺满容器）；个别页面有自己的内容断点。

依据：`src/styles/global.scss`、`src/layouts/ArticleLayout.astro`、`src/components/ArticleFooter.astro`、`src/components/Header.astro`。

## 现有：颜色与主题

| Token                                      | 亮色        | 暗色        |
| ------------------------------------------ | ----------- | ----------- |
| `--color-background-underlying`            | `#ffffff`   | `#000000`   |
| `--color-background-primary`               | `#fbfbfd`   | `#101010`   |
| `--color-background-secondary`             | `#ffffff`   | `#181818`   |
| `--color-background-secondary-hover`       | `#f7f7f7`   | `#202020`   |
| `--color-background-secondary-translucent` | `#ffffffcc` | `#00000080` |
| `--color-text-primary`                     | `#333333`   | `#dddddd`   |
| `--color-text-secondary`                   | `#666666`   | `#999999`   |
| `--color-text-tertiary`                    | `#808080`   | `#808080`   |
| `--color-border-primary`                   | `#88888822` | `#88888844` |
| `--color-border-secondary`                 | `#e6e6e6`   | `#1a1a1a`   |
| `--color-background-accent-contrast`       | `#ffffff`   | `#ffffff`   |
| `--color-background-accent-lite`           | `#e4efff`   | `#233140`   |
| `--color-background-warning`               | `#fcf0d5`   | `#403415`   |
| `--color-background-success`               | `#d7ecdb`   | `#1a311d`   |

品牌色由 `blog.config.ts` 的 `accentColor` 写入 `--site-accent`，当前为 `#0071E3`。按钮背景使用 `--color-background-accent`，悬停和按下使用对应的 `-hover`、`-active` token。链接使用 **`--color-text-accent`**：亮色为品牌色 90% 与黑色混合，暗色为品牌色相对 RGB 加 105/72/28；它与按钮背景不是同一个值。

通用别名包括 `--color-background` → primary 背景、`--color-foreground` → primary 文字、`--color-surface` → secondary 背景、`--color-muted` → secondary 文字、`--color-border` → primary 边框、`--color-accent` → accent 文字。

主题由根元素 `html.dark` 驱动。`blog.config.ts` 支持 `light`、`dark`、`auto`；用户选择保存在 `blog-theme`。组件使用现有颜色变量即可同步主题，不另外通过媒体查询覆盖用户的显式选择。

依据：`src/styles/_tokens.scss`、`src/layouts/Layout.astro`、`src/utils/theme.ts`。

## 现有：字体、圆角与控件

字体栈为 `InterVariable, 'Inter Variable', Inter, sans-serif, system-ui`，启用 `'liga' 1, 'calt' 1`；Inter 由本地依赖加载。中文使用字体栈可用的系统回退。普通界面文字为 16px，行高 `normal`。

| 用途             | 字号 / 字重 / 行高           |
| ---------------- | ---------------------------- |
| 文章标题         | 48px / 700 / normal          |
| 区域标题         | 32px / 700 / 1.125           |
| 卡片标题         | 24px / 700 / normal          |
| 文章正文         | 19px / 400 / 1.4211          |
| 辅助信息与标签   | 常用 14px；文章标签行高 20px |
| 正文 h1–h6 token | 36、30、26、20、16、14px     |

| 半径 token        | 普通圆角 | 支持时的方圆角 |
| ----------------- | -------- | -------------- |
| `--radius-tiny`   | 4px      | 10px           |
| `--radius-small`  | 8px      | 20px           |
| `--radius-medium` | 12px     | 30px           |
| `--radius-large`  | 16px     | 40px           |
| `--radius-full`   | 999px    | 999px          |

`--radius-card` 对应 large，`--radius-media` 与 `--radius-dialog` 对应 medium。当前 `squircle: true`，但只有配置容器查询与 `@supports (corner-shape: squircle)` 同时成立的指定元素才启用方圆角。`src/styles/_mixins.scss` 会在目标上设置方圆角及较大半径，再将后代半径变量重置为普通值；不能把 30px 方圆角半径直接当作普通圆角使用。

搜索框提供输入控件参照：表面背景、1px 淡边框、聚焦时品牌色边框、primary 文字。订阅按钮提供主操作参照：品牌背景、白字、胶囊圆角；次级操作采用透明或表面背景。普通卡片和文字状态过渡约 200ms，标准曲线为 `cubic-bezier(0.86, 0, 0.07, 1)`。

键盘焦点采用 2px `--color-text-accent` 轮廓、2px 偏移。全站已有 `prefers-reduced-motion: reduce` 处理；新增交互不能依赖动画才能显现。

依据：`src/styles/global.scss`、`src/styles/search.scss`、`src/pages/subscribe.astro`。

## 评论区约定：Twikoo

Twikoo 使用固定版本 **2.0.17** 的无 CSS 脚本，样式由本地 `src/styles/comments/twikoo.css` 管理。该文件基于官方样式保留结构能力，再适配本站外观。升级版本时需复核 DOM 类名和状态，不能直接覆盖本地定制。第三方样式限制在 `.article-comments` 内的 `.twikoo` 根节点，避免影响站点其他控件。

- **布局**：实际评论内容宽度沿用文章 800px；外容器为 `800px + 2 × 16px`，与正文使用相同内边距，避免把内边距算入 800px 导致评论少 32px。区块上下间距 64px，标题采用卡片标题 token、700 字重。编辑器、评论列表、空状态和重试状态使用同一内容轴线；窄屏保留 16px 阅读边距。
- **文字**：输入和评论正文采用站点字体、16px；昵称使用明确字重，日期、说明、计数和工具提示采用辅助文字层级。评论正文不是文章 `.prose`，不要继承其 19px 字号或文章容器规则。
- **输入**：昵称、邮箱、网址、textarea、预览和管理输入统一表面背景、primary 文字、站点边框和中小圆角。聚焦有明确反馈，placeholder 不依赖整体低透明度。输入文字保持 16px，避免手机端输入时意外缩放。
- **操作**：提交采用品牌色和胶囊圆角；预览、取消、回复、加载更多采用次级操作样式。悬停、按下、禁用、加载态均需适配亮暗主题，禁用状态同时保留不可操作的语义。
- **内容**：昵称链接、引用、代码、长链接、图片、回复层级、作者/置顶徽标均使用站点语义色与半径。普通评论不叠加重阴影或高饱和装饰色；嵌套回复以轻边界和间距区分。
- **图片与图标**：头像、表情、工具图标显式限定尺寸，抵消全站 `img { width: 100% }` 的影响；正文图片保持宽高比。表情不被错误当作大图，图标使用当前文字色。
- **圆角**：编辑器、预览等表面遵循 medium 半径，紧凑控件使用 small，头像和主按钮使用 full。需要方圆角的表面沿用既有配置/支持检测，内部控件保持独立半径。
- **移动端**：空间不足时个人信息字段纵向排列；工具栏允许换行，回复缩进有上限，长内容可换行。表情面板、管理面板和浮层不得超出视口，保持操作可达。
- **主题与焦点**：颜色直接引用站点 token；本地 CSS 必须覆盖第三方残留的白底、默认蓝、灰字与固定边框。保留可见键盘焦点，不通过无替代的 `outline: none` 隐藏它。
- **语义与浮层**：作者和置顶身份使用浅强调色徽标，不借用成功或错误色。错误提示使用局部 `--tk-danger`（亮色 `#b42332`、暗色 `#ff9b9b`），补足全站尚无错误 token 的情况。管理面板高度由内容与视口约束，不随整段评论列表拉伸；表情与管理入口支持键盘和 Escape。

## 样式验收与维护

### 临时展开管理视图

在文章详情页的浏览器控制台执行：

```js
expandTwikoo()
```

评论内容最大宽度临时扩至 1200px，高度预留接近一屏的管理空间，窄屏仍保留两侧 16px 边距。管理面板同步增高，长配置在面板内滚动。命令不重新初始化 Twikoo，保留当前登录状态和未保存的输入；评论尚未加载时会滚动至评论区并触发原有懒加载。

展开仅在当前页面生效，刷新后恢复，其他文章不受影响。展开后在视口顶部显示“恢复评论区尺寸”按钮，与“跳到正文”共用胶囊、半透明和模糊样式。按钮挂载于 body，避免文章容器及展开动画影响固定定位；点击后恢复正文宽度及原有管理面板高度，隐藏按钮并将焦点交回评论标题，保留登录状态和输入内容。键盘聚焦“跳到正文”时暂时隐藏恢复按钮，避免重叠。

未展开时命令返回 `true`，已展开时返回 `false`，不重复放大或播放动画；恢复后可以再次执行。展开与恢复分别采用 300ms / 240ms、无回弹的 FLIP 动画，只动画变换属性；系统开启减少动态效果时立即切换。按钮、事件监听和控制台命令随文章组件卸载清理。

### 验收范围

在实际构建页面中检查亮色与暗色、桌面与窄屏。除初始状态外，还需检查预览、表情浮层、回复、禁用、加载、错误和管理入口；没有真实数据的状态需明确标注为受控样本，不能当作后端验收结果。

采集容器、标题、输入、textarea、按钮、昵称、时间、正文、头像、徽标、预览和浮层的计算样式：`fontFamily`、`fontSize`、`fontWeight`、`lineHeight`、`color`、`backgroundColor`、`borderColor`、`borderRadius`、`boxShadow`。逐项对照 token，同时检查容器对齐、页面横向溢出与焦点可见性。CSS 声明存在不等于浏览器实际生效，应以这些计算结果和页面截图作为修正依据。
