# Astro Blog Cupertino

基于 Astro 7、Content Collections 与组件群岛构建的 Cupertino 风格静态博客模板。普通页面默认零客户端框架运行时；React 仅用于独立搜索页。

内置文章、归档、分类、标签、全文搜索、友链、作品集、订阅与评论（Twikoo）等完整页面，克隆后替换占位配置即可开始写作。

## 快速开始

```bash
pnpm install
pnpm astro dev --background
```

开发服务器使用 Astro 后台模式：

```bash
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
```

质量检查：

```bash
pnpm run format:check
pnpm run lint
pnpm run check
pnpm run build
```

## 模板自定义清单

开始写自己的博客前，替换以下占位内容：

- `blog.config.ts`：站点名、品牌名、描述、标语、生产域名、作者名、版权与许可
- `blog.config.ts` 的 `comments`：部署自己的 Twikoo 实例后填入 `envId` 并开启
- `src/consts.ts`：顶部导航、页脚分组中的站外链接（如「主页」）
- `src/friends-links.ts`：替换示例友链为自己的友链数据
- `content/about.md`：关于页正文
- `content/works/`：替换示例作品条目
- `public/favicon.png`：站点图标（`favicon-32.png` 等衍生尺寸由构建脚本自动生成）

## 配置与内容

- `blog.config.ts`：站点元信息、作者、版权、强调色、订阅源、远程图片域名与 Cupertino 主题选项。
- `src/consts.ts`：顶部导航、页脚分组和首页文章数量。
- `src/friends-links.ts`：友链分组与友链数据。
- `src/styles/`：外部 SCSS 设计 token、复用样式与搜索页样式；Astro 组件在局部 `<style>` 中维护自身样式。
- `content/posts/*.md`：文章。
- `content/works/*.md`：作品集条目。
- `content/*.md`：独立页面（如关于页），底部带评论区，不含版权与上下篇导航。
- `content/assets/`：由 Astro 优化的本地文章资源。

文章必填 Frontmatter：

```yaml
title: 文章标题
description: SEO、搜索、OG 与订阅摘要
pubDate: 2026-10-18
collection: 前端
```

可选字段：`tags`、`cover`、`coverAlt`、`draft`、`slug`、`excerpt`、`no_comments`、`about`、`extra_info`、`copyright`。

封面可省略，也可将 `cover:` 留空或填写 `cover: ""`。没有封面时，文章页直接显示分类、日期和标题，列表卡片显示文字内容，不保留封面占位。

需要封面时，使用 `cover` 指定图片，并通过 `coverAlt` 填写图片的替代文本：

```yaml
cover: ../assets/example.jpg
coverAlt: 清晨阳光照在山间的松林上
```

`cover` 支持本地文章资源、`public/` 下的绝对路径和已加入 `imageDomains` 的远程图片。`coverAlt` 用于文章页、列表与搜索结果中的封面图片；省略或留空时，使用根据文章标题生成的默认描述。它是图片的 `alt` 文本，不会作为可见图注显示。

正文图片可通过 URL fragment 调整宽度：

```md
![说明](../assets/image.png#width=75%)
![说明](../assets/image.png#width=125%)
![说明](../assets/image.png#width=wide)
```

百分比相对 800px 正文宽度；`wide` 表示全视口宽度。

公开文章会在构建期自动生成 `/archives/`、`/categories/` 和 `/tags/` 及其详情页；`/search/` 使用 Orama 中文分词搜索静态索引，`/archives/` 是文章归档入口。

## 部署

生产构建命令为 `pnpm run build`，输出目录为 `dist/`。产物为纯静态文件，可部署到 Vercel 或 Cloudflare Pages。正式部署前必须替换 `blog.config.ts` 中的占位域名、站点名、作者和站外链接。
