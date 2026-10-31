---
title: VSCodium自用配置
description: 分享我的VSCodium自用配置，包括外观设置、Git配置与开发体验优化，以及实用插件推荐。
pubDate: 2026-07-17
collection: 技术
slug: 38ee48f
tags:
  - vscode
  - 自用
cover: img/vscodium-config/cover.png
---

> 本文部分内容来自 https://blog.zhilu.site/2023/vscode-simple-config

## VSCod ium?

[VSCodium](https://vscodium.com/)是一个由社区维护的编辑器，它直接使用VSCode纯净开源代码构建，更加轻量。

你也可以自己从VSCode源代码构建，VSCodium只是帮你构建了最新MIT许可的VSCode

**我为什么使用VSCodium？**

微软在构建VSCode发行版时，在开源代码的基础上添加了科技与狠活，如品牌标识、插件市场、遥测/追踪数据，以及微软在里面拉的💩

我最近使用VSCode时，没打开软件多久滚动就变得卡顿，懒得自己排除问题，直接换了VSCodium。

## 主题&图标

- 配色：Moonlight II
- 文件图标：Material Icon Theme
- 产品图标：Tabler Product Icons


![VSCodium 的主题与图标效果](img/vscodium-config/1784249578707_image.png)

## 配置文件

### 外观

```jsonc
{
  // 终端字体大小
  "terminal.integrated.fontSize": 17,
  // 终端字体
  "terminal.integrated.fontFamily": "CaskaydiaCove Nerd Font",
  // 编辑器字体
  "editor.fontFamily": "Cascadia Code, Sarasa Gothic SC",
  // 编辑器字体连字特性
  "editor.fontLigatures": true,
  // 编辑器字体大小
  "editor.fontSize": 20,
  // Ctrl+滚轮 缩放编辑器字体大小
  "editor.mouseWheelZoom": true,
  // 编辑器的空格渲染为“·”，并隐藏字词之间的单个空格
  "editor.renderWhitespace": "boundary",
  // 编辑器自动换行，也可通过 Alt+Z 切换
  "editor.wordWrap": "on",
  // Ctrl+滚轮 缩放终端字体大小
  "terminal.integrated.mouseWheelZoom": true,
  // 编辑器选项卡自动换行而非横向滚动
  "workbench.editor.wrapTabs": true,
  // 编辑器光标渐变闪烁动画
  "editor.cursorBlinking": "phase",
  // 编辑器光标平滑移动动画
  "editor.cursorSmoothCaretAnimation": "on",
  // 括号对高亮引导线
  "editor.guides.bracketPairs": true,
  // 最后一空行淡化行号
  "editor.renderFinalNewline": "dimmed",
  // 编辑器平滑滚动动画
  "editor.smoothScrolling": true,
  // 终端平滑滚动动画
  "terminal.integrated.smoothScrolling": true,
  // 终端当前命令吸附至顶端
  "terminal.integrated.stickyScroll.enabled": true,
  // 设置工作台活动栏（左侧栏）图标置顶，增加横向空间
  "workbench.activityBar.location": "top",
  // 启用工作台列表平滑滚动动画
  "workbench.list.smoothScrolling": true,
}
```

编辑器字体使用微软的Cascadia Code，支持连字特性；同时使用更纱黑体显示中文，写作时也很舒适。

因为我使用Oh My Posh对终端进行了美化，所以终端使用Nerd字体。

### 开发体验

```jsonc
{
  // 对于 Markdown 文件
  "[markdown]": {
    "editor.fontSize": 19,
    // 启用 Markdown 打字机模式，打字时当前行位于屏幕中央
    // 较大的值会完全居中，同时不利于拖动选中的文本
    // 我的窗口高度较大所以设置16行，笔记本电脑可以设置较小的值
    "editor.cursorSurroundingLines": 16,
    // 不猜测字符集编码，因为绝大多数都使用 UTF-8
    "files.autoGuessEncoding": false,
    // 保存时不删除行末空格，因为尾随两个空格代表换行
    "files.trimTrailingWhitespace": false,
  },
  // 保存时自动格式化，可按 Ctrl+K, Ctrl+Shift+S 保存时不格式化
  "editor.formatOnSave": true,
  // 编写代码时自动格式化
  "editor.formatOnType": true,
  // 自动检测文件编码
  "files.autoGuessEncoding": true,
  // Git 定时拉取
  "git.autofetch": true,
  // 编辑器行内显示 Git blame 追溯信息
  "git.blame.editorDecoration.enabled": true,
  // 编辑器状态栏显示 Git blame 追溯信息
  "git.blame.statusBarItem.enabled": true,
  // 同步 Git 存储库无需确认
  "git.confirmSync": false,
  // 在没有暂存的更改时提交所有更改
  "git.enableSmartCommit": true,
  // 集成终端中 Git 触发编辑器时使用 VS Code
  "git.terminalGitEditor": true,
  // 增大集成终端最大记录行数
  "terminal.integrated.scrollback": 10000,
  // 默认在新窗口中打开文件夹，不然新打开的文件会覆盖已打开的
  "window.openFoldersInNewWindow": "on",
}
```

## 自用插件

因为我使用VSCodium，所以插件市场是Open VSX（一些国产AI IDE应该也是），但VSCode市场也有这些插件。

### Image preview

代码中有图片URL时，本行行数左侧会显示缩略图，鼠标悬浮在URL上时可以预览图片：

![Image preview 插件在代码中预览图片](img/vscodium-config/1784301877723_image.png)

### Color Highlight

在编写样式时比较有用，在有颜色值的地方直接显示颜色，HEX与RGB能正常显示，但是HSL貌似用不了。

### ESLint+Stylelint

代码规范化专家

### Oxc

oxlint与oxfmt的配套插件，我自己开发时常用，比ESLint更轻量，但大型项目还是使用上一个方案比较好。

### Iconify IntelliSense

antfu开发，在行内显示iconify图标库的图标，支持输入时显示候选图标列表。

![Iconify IntelliSense 的行内图标与候选列表](img/vscodium-config/mriMUzRO.jpg)

### Error Lens

更直观与醒目的错误信息显示。