# Dino Blog

基于 Astro 7、Content Collections 与组件群岛构建的静态中文博客。普通页面默认零客户端框架运行时；React 仅在首次打开搜索时按需加载。

## 开发

```bash
pnpm install
pnpm run generate:covers
pnpm run dev
```

开发服务器使用 Astro 后台模式：

```bash
pnpm run dev:status
pnpm run dev:logs
pnpm run dev:stop
```

质量检查：

```bash
pnpm run format:check
pnpm run lint
pnpm run check
pnpm run build
```

## 配置与内容

- `blog.config.ts`：站点元信息、作者、版权、强调色、订阅源和远程图片域名。
- `src/consts.ts`：顶部导航、页脚分组和首页文章数量。
- `src/friends-links.ts`：友链分组与友链数据。
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

正文图片可通过 URL fragment 调整宽度：

```md
![说明](../assets/image.png#width=75%)
![说明](../assets/image.png#width=125%)
![说明](../assets/image.png#width=wide)
```

百分比相对 800px 正文宽度；`wide` 表示全视口宽度。

## 部署

生产构建命令为 `pnpm run build`，输出目录为 `dist/`。产物为纯静态文件，可部署到 Vercel 或 Cloudflare Pages。正式部署前必须替换 `blog.config.ts` 中的占位域名、站点名、作者和站外链接。
