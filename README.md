# Dino Blog

基于 Astro 7、Content Collections 与组件群岛构建的静态中文博客。普通页面默认零客户端框架运行时；React 仅用于独立搜索页。

## 开发

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

## 配置与内容

- `blog.config.ts`：站点元信息、作者、版权、强调色、订阅源、远程图片域名与 Cupertino 主题选项。
- `src/consts.ts`：顶部导航、页脚分组和首页文章数量。
- `src/friends-links.ts`：友链分组与友链数据。
- `src/styles/`：外部 SCSS 设计 token、复用样式与搜索页样式；Astro 组件在局部 `<style>` 中维护自身样式。
- `content/posts/*.md`：文章。
- `content/assets/`：由 Astro 优化的本地文章资源。

文章必填 Frontmatter：

```yaml
title: 文章标题
description: SEO、搜索、OG 与订阅摘要
pubDate: 2026-10-18
collection: 前端
```

可选字段：`tags`、`cover`、`coverAlt`、`updatedDate`、`draft`、`copyright`。

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

公开文章会在构建期自动生成 `/archives/`、`/categories/` 和 `/tags/` 及其详情页；`/search/` 使用 Orama 中文分词搜索静态索引。`/posts/` 是公开文章归档入口。

## 部署

生产构建命令为 `pnpm run build`，输出目录为 `dist/`。产物为纯静态文件，可部署到 Vercel 或 Cloudflare Pages。正式部署前必须替换 `blog.config.ts` 中的占位域名、站点名、作者和站外链接。
